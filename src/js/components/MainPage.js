import { select } from '../settings.js';

class MainPage {
  constructor(element) {
    const thisMainPage = this;

    thisMainPage.getElement(element);
    thisMainPage.initAction();
  }


  /*[DONE] Function that iterate through numbers of courusels items */
  idOfCarouselElem(){
    const thisMainPage = this;

    /*[DONE] get id of active item in carousel and put it in variable for selecting next element*/
    let n = Array.from(thisMainPage.dom.carouselItems).indexOf(thisMainPage.dom.wrapper.querySelector(select.mainPage.carousel.activeCarouselItem));

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

  removeActiveClassCarouselItem(){
    const thisMainPage = this;

    /*START LOOP: for all carousel items */
    for(let item of thisMainPage.dom.carouselItems){
      /* [DONE] remove active class */
      item.classList.remove('active');

    /*END LOOP: for all carousel items */
    }
  }

  changeActiveCarouselItem(n){
    const thisMainPage = this;

    /* [DONE] remove active class */
    thisMainPage.removeActiveClassCarouselItem();
    /* [DONE] change active carousel item */
    thisMainPage.dom.carouselItems[n].classList.add('active');
  }

  initAction(){
    const thisMainPage = this;

    window.addEventListener('load', function(){
      this.setInterval(function()
      {thisMainPage.changeActiveCarouselItem(thisMainPage.idOfCarouselElem());}
      , 8000);
    });
  }

  getElement(element) {
    const thisMainPage = this;

    thisMainPage.dom = {};
    thisMainPage.dom.wrapper = element;

    thisMainPage.dom.carouselWrapper = thisMainPage.dom.wrapper.querySelector(select.mainPage.carousel.carouselWrapper);
    thisMainPage.dom.carouselItems = thisMainPage.dom.wrapper.querySelectorAll(select.mainPage.carousel.carouselItem);

  }
}

export {MainPage};
