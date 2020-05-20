import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import { DatePicker } from './DatePicker.js';
import { HourPicker } from './HourPicker.js';
import { AmountWidgetHour } from './AmountWidgetHour.js';

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
    thisBooking.changeRangeSliderBC();
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

      for(let tab of table){
        thisBooking.booked[date][hourBlock].push(tab);
      }
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
        thisBooking.tableDurationHour();
        thisBooking.openHourDuration();
      });
    }

    /* [DONE] Add event listener for date piceker */
    thisBooking.dom.datePicker.addEventListener('update', function(){
      /*[DONE] remove active class from table */
      thisBooking.removeActiveTables();
      thisBooking.changeRangeSliderBC();
    });

    /* [DONE] Add event listener for hour piceker */
    thisBooking.dom.hourPicker.addEventListener('update', function(){
      /*[DONE] remove active class from table */
      thisBooking.removeActiveTables();
      thisBooking.changeRangeSliderFillBC();
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

  renderGradientCode() {
    const thisBooking = this;
    let gradientCode = '';
    let previousColor = ' green ';

    /*[DONE] Get reservations form the selected day */
    const currentReservation = thisBooking.booked[thisBooking.datePicker.value];

    /*START LOOP: for all hours */
    for(let i = settings.hours.open; i <= settings.hours.close; i += 0.5){
      /*IF: current reservation array is not undefined */
      if(currentReservation[i] != undefined){
        /*SWITCH: length of array */
        const percent = ((i-12) * 100)/(settings.hours.close - 12);
        switch (currentReservation[i].length) {
        case 1:
          previousColor += percent + '%,';
          gradientCode += previousColor + ' green ' + percent + '%,';
          previousColor = ' green ';
          break;
        case 2:
          previousColor += percent + '%,';
          gradientCode += previousColor + ' orange ' + percent + '%,';
          previousColor = ' orange ';
          break;
        case 3:
          previousColor += percent + '%,';
          gradientCode += previousColor + ' red ' + percent + '%,';
          previousColor = ' red ';
          break;
        default:
          previousColor += percent + '%,';
          gradientCode += previousColor + ' red ' + percent + '%,';
          previousColor = ' red ';
        }

      /*END IF: current reservation array is not undefined  */
      } else {
        const percent = ((i-12) * 100)/(settings.hours.close - 12);
        previousColor += percent + '%,';
        gradientCode += previousColor + ' green ' + percent + '%,';
        previousColor = ' green ';
      }
    /*END LOOP: for all hours */
    }

    return gradientCode.substring(0, gradientCode.length - 1);
  }

  changeRangeSliderBC() {
    const thisBooking = this;

    const gradientCode = thisBooking.renderGradientCode();

    document.querySelector(select.booking.rangeSlider).style.background = 'linear-gradient(to right,' + gradientCode + ')';
  }

  changeRangeSliderFillBC() {
    document.querySelector(select.booking.rangeSliderFill).style.opacity = 0;
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

  tableDurationHour() {
    const thisBooking = this;
    let duration = settings.amountWidget.defaultMax;

    /* [DONE] get selected hour */
    const selectedHour = utils.hourToNumber(thisBooking.hourPicker.value);

    /*[DONE] search for all selected table */
    const tableSelected = thisBooking.dom.bookingWrapper.querySelectorAll(select.booking.tables + '.' + classNames.booking.tableSelected);

    /*[DONE] Get reservations form the selected day */
    const currentReservation = thisBooking.booked[thisBooking.datePicker.value];

    /*START LOOP: For all Table selected */
    for(let table of tableSelected) {
      /*[DONE] get data-table atribute */
      const dataTable = parseInt(table.getAttribute(settings.booking.tableIdAttribute));

      /*START LOOP: for all reservation in selected Day */
      for(let reservation in currentReservation) {

        /*START IF: if current reservation have selected table */
        if(currentReservation[reservation].indexOf(dataTable) != -1 && reservation >= selectedHour) {

          duration = reservation - selectedHour <= duration ? reservation - selectedHour : duration;

        /*END IF: if current reservation have selected table */
        }
      /*END LOOP: for all reservation in selected Day */
      }
    /*END LOOP: For all Table selected */
    }

    return duration;
  }

  openHourDuration() {
    const thisBooking = this;
    const duration = 24 - utils.hourToNumber(thisBooking.hourPicker.value);

    return duration == 24 ? 0: duration;
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

      const duration = parseFloat(thisBooking.dom.hoursAmount.querySelector('input').value);
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
    //thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.hoursAmount = new AmountWidgetHour(thisBooking.dom.hoursAmount, settings.amountWidget.defaultMax);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.bookingWrapper.addEventListener('update', function(){
      thisBooking.updateDOM();
    });
  }
}
