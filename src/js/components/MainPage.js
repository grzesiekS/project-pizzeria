import { select } from '../settings.js';

class MainPage {
  constructor(element) {
    const thisMainPage = this;

    thisMainPage.getElement(element);
    thisMainPage.initAction();
  }


  /*TODO: Function that iterate through numbers of courusels items */
  idOfCarouselElem(){
    const thisMainPage = this;

    /*[DONE] get id of active item in carousel and put it in variable for selecting next element*/
    let n = Array.from(thisMainPage.dom.carouselItems).indexOf(thisMainPage.dom.activeCarouselItem);

    /*START IF: Check if Id of active item is the last in array */
    if(n >= thisMainPage.dom.carouselItems.length - 1){
      /*[DONE] Change id of the active item to 0 */
      n = 0;
    } else {
      /*[DONE] Change id of the */
      n++;
    /*END IF */
    }
    return n;
  }

  initAction(){
    const thisMainPage = this;

    window.addEventListener('load', function(){
      this.setInterval(function() {thisMainPage.idOfCarouselElem();}, 4000);
    });
  }

  getElement(element) {
    const thisMainPage = this;

    thisMainPage.dom = {};
    thisMainPage.dom.wrapper = element;

    thisMainPage.dom.carouselWrapper = thisMainPage.dom.wrapper.querySelector(select.mainPage.carousel.carouselWrapper);
    thisMainPage.dom.carouselItems = thisMainPage.dom.wrapper.querySelectorAll(select.mainPage.carousel.carouselItem);
    thisMainPage.dom.activeCarouselItem = thisMainPage.dom.wrapper.querySelector(select.mainPage.carousel.activeCarouselItem);
  }
}

export {MainPage};
