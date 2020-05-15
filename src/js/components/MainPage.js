import { select } from '../settings.js';

class MainPage {
  constructor(element) {
    const thisMainPage = this;

    thisMainPage.getElement(element);
    console.log(thisMainPage);
  }

  getElement(element) {
    const thisMainPage = this;

    thisMainPage.dom = {};
    thisMainPage.dom.wrapper = element;

    thisMainPage.dom.carouselWrapper = thisMainPage.dom.wrapper.querySelector(select.mainPage.carousel.carouselWrapper);
    thisMainPage.dom.carouselItem = thisMainPage.dom.wrapper.querySelectorAll(select.mainPage.carousel.carouselItem);
  }
}

export {MainPage};
