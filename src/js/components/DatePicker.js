import { BaseWidget } from './BaseWidget.js';
import utils from '../utils.js';
import { select, settings } from '../settings.js';
/* global flatpickr */

class DatePicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();
  }

  initPlugin(){
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);


    flatpickr(thisWidget.dom.input,{
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,

      'locale': {
        'firstDayOfWeek': 1 // start week on Monday
      },
      'disable': [
        function(date) {
          // return true to disable
          return (date.getDay() === 1);
        }
      ],
      onChange: function(dateObj, dataStr){
        //thisWidget.value = dateObj[0];
        thisWidget.value = dataStr;
      }
    });
  }

  parseValue(value) {
    return value;
  }

  renderValue() {

  }

  isValid(value){
    return isNaN(value);
  }
}

export {DatePicker};
