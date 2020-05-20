import { BaseWidget } from './BaseWidget.js';
import { settings, select } from '../settings.js';

class AmountWidgetHour extends BaseWidget {
  constructor(element, maxValue) {
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;
    thisWidget.maxValue = maxValue;
    thisWidget.getElements();

    thisWidget.value = thisWidget.dom.input.value;
    // console.log('thisWidget.value', thisWidget.value);
    thisWidget.initActions();
  }

  isValid(value){
    const thisWidget = this;

    return !isNaN(value)
      && value >= settings.amountWidget.hourMin
      && value <= thisWidget.maxValue;
  }

  parseValue(value) {
    return parseFloat(value);
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function(){
      //thisWidget.setValue(thisWidget.dom.input.value);
      thisWidget.value = thisWidget.dom.input.value;
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function(){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 0.5);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function(){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 0.5);
    });

  }

  getElements(){
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }
}

export {AmountWidgetHour};
