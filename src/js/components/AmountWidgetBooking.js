import { BaseWidget } from './BaseWidget.js';
import { settings, select } from '../settings.js';

class AmountWidgetBooking extends BaseWidget {
  constructor(element, maxValue) {
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;
    thisWidget.maxValue = maxValue;
  }

  getElements(){
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }
}

export {AmountWidgetBooking};
