import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import {Booking} from './components/Booking.js';
import { MainPage } from './components/MainPage.js';

const app = {
  initPages: function() {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages){
      if(page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks) {
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');

        /* run thisApp.activatePage with that id */
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId) {
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching */
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    /* add class "active" to matching links, remove from non-matching */
    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

  disableElements: function() {
    /*[DONE] Get class list from main page wrapper */
    const classList = Array.from(document.querySelector(select.containerOf.mainPage).classList);

    /*START IF: Check if main page has active class */
    if(classList.indexOf('active') == -1){
      /*[DONE] Add disable class to main-nav*/
      document.querySelector('.main-nav').classList.remove('disable');
      /*[DONE] Add disable class to cart */
      document.querySelector('#cart').classList.remove('disable');

    /*END IF: Check if main page has active class */
    }
  },

  initMenu: function() {
    const thisApp = this;
    //console.log('thisApp.data:', thisApp.data);

    for(let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function() {
    const thisApp = this;
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        //console.log('parsedResponse', parsedResponse);

        /* [DONE] save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* [DONE] execute initMenu method */
        thisApp.initMenu();
      });

    //console.log('thisApp.data', JSON.stringify(thisApp.data));

    thisApp.data = {};
  },

  initBooking: function() {
    const thisApp = this;

    /* [DONE] get booking wrapper */
    thisApp.bookingWrapper = document.querySelector(select.containerOf.booking);

    /* [DONE] create new instance of class Booking */
    thisApp.booking = new Booking(thisApp.bookingWrapper);

  },

  initStickyHeader: function() {
    window.onscroll = function() {
      const header = document.querySelector('.header');
      const sticky = header.offsetTop;

      if (window.pageYOffset > sticky) {
        header.classList.add('sticky');
      } else {
        header.classList.remove('sticky');
      }
    };
  },

  init: function(){
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);

    thisApp.initPages();

    thisApp.initData();
    thisApp.initMainPage();
    thisApp.disableElements();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initStickyHeader();
  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  initMainPage: function(){
    const thisApp = this;

    const mainPageElement = document.querySelector(select.containerOf.mainPage);
    thisApp.mainPage = new MainPage(mainPageElement);
  },
};

app.init();

