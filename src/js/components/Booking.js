import { templates, select } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

export class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWdgets();
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
  }

  initWdgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}
