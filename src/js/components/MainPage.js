import { select } from '../settings.js';

class MainPage {
  constructor(element) {
    const thisMainPage = this;

    thisMainPage.getElement(element);
    thisMainPage.initAction();
    thisMainPage.addDisableClass();
  }

  addDisableClass(){
    const thisMainPage = this;

    /*[DONE] Get class list from main page wrapper */
    const classList = Array.from(thisMainPage.dom.wrapper.classList);

    /*START IF: Check if main page has active class */
    if(classList.indexOf('active') != -1){
      /*[DONE] Add disable class to main-nav*/
      document.querySelector('.main-nav').classList.add('disable');
      /*[DONE] Add disable class to cart */
      document.querySelector('#cart').classList.add('disable');

    /*END IF: Check if main page has active class */
    }

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

  removeActiveClassDottedList(){
    const thisMainPage = this;

    /*START LOOP: for all li items in carousel widget */
    for(let dot of thisMainPage.dom.dottedList){
      /*[DONE] remove active class */
      dot.classList.remove('active');

    /*END LOOP: for all li items in carousel widget */
    }
  }

  changeActiveCarouselItem(n){
    const thisMainPage = this;

    /* [DONE] remove active class */
    thisMainPage.removeActiveClassCarouselItem();
    /* [DONE] change active carousel item */
    thisMainPage.dom.carouselItems[n].classList.add('active');

    /*[DONE] remove active class from dotted list*/
    thisMainPage.removeActiveClassDottedList();
    /*[DONE] add activle class for dot element */
    thisMainPage.changeActiveDot(n);
  }

  changeActiveDot(n){
    const thisMainPage = this;

    /* [DONE] Add active class */
    thisMainPage.dom.dottedList[n].classList.add('active');
  }

  removeDisableClass(){
    /* Select all elements with class disable */
    const disableElements = document.querySelectorAll('.disable');

    /*START LOOP: for all elements with class disable */
    for(let disEle of disableElements){
      /* [DONE] remove disable class from all html element */
      disEle.classList.remove('disable');
    /*END LOOP: for all elements with class disable */
    }
  }

  sectionActive(btnClicked){
    const thisMainPage = this;

    /* [DONE] Get link element from the button element */
    const link = btnClicked.querySelector('a');

    /*[DONE] Get href atribute from link element */
    const hrefAtr = link.getAttribute('href');

    /*[DONE] remove active class from main page */
    thisMainPage.dom.wrapper.classList.remove('active');

    /*[DONE] Add active class for the section with id that equals href atribute */
    document.querySelector(hrefAtr).classList.add('active');

    /* Add class active to link in nav*/
    document.querySelector('[href="'+ hrefAtr +'"]').classList.add('active');
  }

  initAction(){
    const thisMainPage = this;

    window.addEventListener('load', function(){
      this.setInterval(function()
      {thisMainPage.changeActiveCarouselItem(thisMainPage.idOfCarouselElem());}
      , 3000);
    });

    /*START LOOP: for all button selecting a section */
    for(let btn of thisMainPage.dom.btnSectionSelect){
      /*[DONE] Add eventlistener button selecting a section */
      btn.addEventListener('click', function(){
        event.preventDefault();
        thisMainPage.removeDisableClass();
        thisMainPage.sectionActive(btn);
      });

    /*END LOOP: for all button selecting a section */
    }
  }

  getElement(element) {
    const thisMainPage = this;

    thisMainPage.dom = {};
    thisMainPage.dom.wrapper = element;

    thisMainPage.dom.carouselWrapper = thisMainPage.dom.wrapper.querySelector(select.mainPage.carousel.carouselWrapper);
    thisMainPage.dom.carouselItems = thisMainPage.dom.wrapper.querySelectorAll(select.mainPage.carousel.carouselItem);
    thisMainPage.dom.dottedList = thisMainPage.dom.wrapper.querySelectorAll(select.mainPage.carousel.dottedList);

    thisMainPage.dom.btnSectionSelect = thisMainPage.dom.wrapper.querySelectorAll(select.mainPage.btnSelect);
  }
}

export {MainPage};
