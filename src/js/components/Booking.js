import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import { DatePicker } from './DatePicker.js';
import { HourPicker } from './HourPicker.js';

export class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWdgets();
    thisBooking.getData();
    thisBooking.initActions();
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    // console.log('getData params', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsRepeat.join('&'),
    };

    // console.log('urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponse){
        const bookingResponse = allResponse[0];
        const eventsCurrentResponse = allResponse[1];
        const eventsRepeatResponse = allResponse[2];
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }

      }
    }

    // console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      // console.log('loop', hourBlock);
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

  }

  initActions(){
    const thisBooking = this;

    /*[DONE] Add eventListener to all table object */
    for(let table of thisBooking.dom.tables){
      table.addEventListener('click', function(){
        /*[DONE] toggle class active to selected table */
        thisBooking.addActiveTable(table);
      });
    }

    /* [DONE] Add event listener for date piceker */
    thisBooking.dom.datePicker.addEventListener('update', function(){
      /*[DONE] remove active class from table */
      thisBooking.removeActiveTables();
    });

    /* [DONE] Add event listener for hour piceker */
    thisBooking.dom.hourPicker.addEventListener('update', function(){
      /*[DONE] remove active class from table */
      thisBooking.removeActiveTables();
    });

    /* Add event listener for change in the Order Confirmation wrapper */
    thisBooking.dom.OrderConfWrapp.addEventListener('change', function(){
      thisBooking.checkPhoneNumber(thisBooking.dom.phone);
      thisBooking.checkAddress(thisBooking.dom.address);
    });

    /*[DONE] Add event listener for submit*/
    thisBooking.dom.form.addEventListener('submit', function(){
      event.preventDefault();
      thisBooking.bookTable();
    });

  }

  removeActiveTables(){
    const thisBooking = this;

    /*START LOOP: For all tables */
    for(let table of thisBooking.dom.tables) {
      /* [DONE] remove active class from all tables */
      table.classList.remove(classNames.booking.tableSelected);
    }
    /*END LOOP: For all tables */
  }

  addActiveTable(tableSelected) {

    const tableClassAtr = tableSelected.getAttribute('class');
    /*IF: selected element includes class booked*/
    if(!tableClassAtr.includes(classNames.booking.tableBooked)){

      /* [DONE] Toggle active class for a selected Table */
      tableSelected.classList.toggle(classNames.booking.tableSelected);
    /*END IF*/
    }

  }

  blockTable(tables) {
    for(let table of tables){
      table.classList.add(classNames.booking.tableBooked);
    }
  }

  verifyTableSelection() {
    const thisBooking = this;

    const bookedTable = thisBooking.dom.bookingWrapper
      .querySelector(select.booking.tables + '.' + classNames.booking.tableSelected);

    return bookedTable == null ? true : false;
  }

  checkPhoneNumber(phoneNumberObj) {

    if(phoneNumberObj.value.length >= 9) {
      phoneNumberObj.classList.remove(classNames.cart.fieldError);
      return true;
    } else {
      phoneNumberObj.classList.add(classNames.cart.fieldError);
      return false;
    }
  }

  checkAddress(addressObj) {

    if(addressObj.value != ''){
      addressObj.classList.remove(classNames.cart.fieldError);
      return true;
    } else {
      addressObj.classList.add(classNames.cart.fieldError);
      return false;
    }
  }

  bookTable() {
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;
    const tableVerifyResult = thisBooking.verifyTableSelection();
    const phoneNumberObj = thisBooking.dom.phone;
    const addressObj = thisBooking.dom.address;

    thisBooking.checkPhoneNumber(phoneNumberObj);
    thisBooking.checkAddress(addressObj);

    /* IF: verify if table was selected */
    if(!tableVerifyResult
      && thisBooking.checkPhoneNumber(phoneNumberObj)
      && thisBooking.checkAddress(addressObj)) {

      const duration = parseInt(thisBooking.dom.hoursAmount.querySelector('input').value);
      const pplAmount = parseInt(thisBooking.dom.peopleAmount.querySelector('input').value);
      const tableSelected = thisBooking.dom.bookingWrapper
        .querySelectorAll(select.booking.tables + '.' + classNames.booking.tableSelected);

      const payload = {
        date: thisBooking.datePicker.value,
        hour: thisBooking.hourPicker.value,
        table: [],
        duration: duration,
        ppl: pplAmount,
        starters: [],
        address: addressObj.value,
        phone: phoneNumberObj.value,
      };

      /*START LOOP: For all selected tables */
      for(let selectedTable of tableSelected){
        /*Add data-table to payload.table */
        payload.table.push(parseInt(selectedTable.getAttribute('data-table')));

      /*END LOOP: For all selected tables */
      }

      /*START LOOP: For all inputs in checkbox for starters */
      for(let input of thisBooking.dom.starters){
        /*IF: input is checked */
        if(input.checked){
          /* [DONE] Add input value to payload.starters */
          payload.starters.push(input.value);
        /*END IF*/
        }
        /*END LOOP: For all inputs in checkbox for starters */
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options)
        .then(function(response){
          return response.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);
          thisBooking.getData();
        });

      thisBooking.blockTable(tableSelected);
      thisBooking.removeActiveTables();
    /* END IF */
    }

  }

  render(element) {
    const thisBooking = this;

    /* [DONE] generate HTML code hendlebar template */
    const generatedHTML = templates.bookingWidget();

    /* [DONE] create object DOM*/
    thisBooking.dom = {};

    thisBooking.dom.bookingWrapper = element;

    /* [DONE] add dom element generated form html to booking Wrapper */
    thisBooking.dom.bookingWrapper.appendChild(utils.createDOMFromHTML(generatedHTML));

    thisBooking.dom.peopleAmount = thisBooking.dom.bookingWrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.bookingWrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.bookingWrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.bookingWrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.bookingWrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.starters = thisBooking.dom.bookingWrapper.querySelectorAll(select.booking.startersInput);
    thisBooking.dom.form = thisBooking.dom.bookingWrapper.querySelector(select.booking.bookingForm);

    thisBooking.dom.address = thisBooking.dom.bookingWrapper.querySelector(select.booking.address);
    thisBooking.dom.phone = thisBooking.dom.bookingWrapper.querySelector(select.booking.phone);
    thisBooking.dom.OrderConfWrapp = thisBooking.dom.bookingWrapper.querySelector(select.booking.confirmationWrapper);
  }

  initWdgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.bookingWrapper.addEventListener('update', function(){
      thisBooking.updateDOM();
    });
  }
}
