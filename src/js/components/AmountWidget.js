import {settings, select} from '../settings.js';
import {BaseWidget} from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;
    thisWidget.getElements(element);

    // thisWidget.dom.maxValue = parseInt(thisWidget.dom.maxValue) ? thisWidget.dom.maxValue : settings.amountWidget.defaultMax;
    // thisWidget.dom.minValue = parseInt(thisWidget.dom.minValue) ? thisWidget.dom.minValue : settings.amountWidget.defaultMin;

    //thisWidget.dom.input.value = parseInt(thisWidget.dom.input.value) ? thisWidget.dom.input.value : thisWidget.dom.minValue;
    //console.log('thisWidget.value', thisWidget.value);
    thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.initActions();

    //console.log('AmountWidget:', thisWidget);
    //console.log('constructor arguments:', element);
  }

  isValid(value){
    return !isNaN(value)
      && value >= settings.amountWidget.defaultMin
      && value <= settings.amountWidget.defaultMax;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.dom.input.value);

    });

    thisWidget.dom.linkDecrease.addEventListener('click', function(){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function(){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });

  }

  getElements(){
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

}

export default AmountWidget;
