/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
        max: 'data-max',
        min: 'data-min',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product {
    constructor(id , data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      //console.log('new Product:', thisProduct);
    }

    renderInMenu(){
      const thisProduct = this;

      /* [DONE] generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* [DONE] create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* [DONE] find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* [DONE] add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    initAccordion(){
      const thisProduct = this;

      /* [DONE] find the clickable trigger (the element that should react to clicking) */
      //const clickableElement = thisProduct.element.querySelector(select.menuProduct.clickable);
      //console.log('clickableElement:',clickableElement);

      /* START: click event listener to trigger */
      thisProduct.accordionTrigger.addEventListener('click', function(){

        /* [DONE] prevent default action for event */
        event.preventDefault();

        /* [DONE] toggle active class on element of thisProduct */
        const parentClickableElement = thisProduct.accordionTrigger.parentElement;
        parentClickableElement.classList.toggle(classNames.menuProduct.wrapperActive);

        /* [DONE] find all active products */
        const allActiveProducts = document.querySelectorAll(select.all.menuProductsActive);

        /* START LOOP: for each active product */
        for(let product of allActiveProducts) {

          /* START: if the active product isn't the element of thisProduct */
          if(product != parentClickableElement) {
            /*[DONE] remove class active for the active product */
            product.classList.remove(classNames.menuProduct.wrapperActive);

          /* END: if the active product isn't the element of thisProduct */
          }
        /* END LOOP: for each active product */
        }

      /* END: click event listener to trigger */
      });
    }

    initOrderForm() {
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs) {
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click',function(){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });

    }

    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData:', formData);

      thisProduct.params = {};

      /* [DONE] Get actual price for the product */
      let actualPrice = parseInt(thisProduct.data.price);

      /* START LOOP: For each param elments of products */
      for(let param in thisProduct.data.params){

        const paramElment = thisProduct.data.params[param];

        /* START LOOP: for each value of param element */
        for(let opt in paramElment.options) {

          const paramElementValue = paramElment.options[opt];

          /* START: If the option is selected and is not default */
          if (formData.hasOwnProperty(param) && formData[param].indexOf(opt) != -1 && !paramElementValue.default) {
            /* [DONE] Add price of the option to price of the product */
            actualPrice += paramElementValue.price;

          /* ELSE IF: If the option is not selected and it is default */
          } else if(formData.hasOwnProperty(param) && formData[param].indexOf(opt) == -1 && paramElementValue.default) {

            /* [DONE] Subtract price of the option from price of the product */
            actualPrice -= paramElementValue.price;

          /* ELSE IF: if any of the options were not selected */
          } else if(formData[param] == null && paramElementValue.default) {

            /*[DONE] subtract price of all defoult options*/
            actualPrice -= paramElementValue.price;

            /* END: If the option is selected and is not default*/
          }
          /* [DONE] create variable with selected elements */
          const selectedElements = thisProduct.imageWrapper.querySelectorAll('.' + param + '-' + opt);

          /* START: If option is selected */
          if(formData.hasOwnProperty(param) && formData[param].indexOf(opt) != -1) {

            if(!thisProduct.params[param]) {
              thisProduct.params[param] = {
                label: paramElment.label,
                options: {},
              };
            }

            thisProduct.params[param].options[opt] = paramElementValue.label;

            /* START LOOP: for each of selected element */
            for(let element of selectedElements) {
              /* [DONE] add class active to selected image */
              element.classList.add(classNames.menuProduct.imageVisible);

            /* END LOOP: for each of selected element */
            }

          /* ELSE */
          } else {

            /* START LOOP: for each of selected element */
            for(let element of selectedElements) {
              /* [DONE] remove class active from selected image */
              element.classList.remove(classNames.menuProduct.imageVisible);

            /* END LOOP: for each of selected element */
            }

          /* END: If option is selected */
          }
        /* END LOOP: for each value of param element */
        }
      /* END LOOP: For each param elments of products */
      }

      /* [DONE] multiply actualPrice amount */
      thisProduct.priceSingle = actualPrice;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

      /*[DONE] Add new price for the product */
      thisProduct.priceElem.innerHTML = thisProduct.price;

      //console.log('Params:', thisProduct.params);

    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('update', function(){
        thisProduct.processOrder();
      });
    }

    addToCart() {
      const thisProduct = this;

      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;

      app.cart.add(thisProduct);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);

    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element);

      thisWidget.maxValue = parseInt(thisWidget.maxValue) ? thisWidget.maxValue : settings.amountWidget.defaultMax;
      thisWidget.minValue = parseInt(thisWidget.minValue) ? thisWidget.minValue : settings.amountWidget.defaultMin;

      thisWidget.input.value = parseInt(thisWidget.input.value) ? thisWidget.input.value : thisWidget.minValue;
      //console.log('thisWidget.value', thisWidget.value);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

      //console.log('AmountWidget:', thisWidget);
      //console.log('constructor arguments:', element);
    }

    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value);

      /* [DONE] TODO: Add Validation */
      if(thisWidget.value != newValue && newValue >= thisWidget.minValue && newValue <= thisWidget.maxValue) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;
    }

    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });

    }

    announce() {
      const thisWidget = this;

      const event = new Event('update');
      thisWidget.element.dispatchEvent(event);
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
      thisWidget.maxValue = thisWidget.input.getAttribute(select.widgets.amount.max);
      thisWidget.minValue = thisWidget.input.getAttribute(select.widgets.amount.min);
    }

  }

  class Cart {
    constructor(element){
      const thisCart = this;

      thisCart.products = [];
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.getElements(element);
      thisCart.initActions();

      //console.log('new Cart', thisCart);
    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct) {
      const thisCart = this;

      /* [DONE] create HTML code in const generatedHTML */
      const generatedHTML= templates.cartProduct(menuProduct);
      //console.log('generatedHTML', generatedHTML);

      /* [DONE] convert HTML code to DOM element */
      thisCart.element = utils.createDOMFromHTML(generatedHTML);

      /* [DONE] Add DOM elements to thisCart.dom.productList */
      thisCart.dom.productList.appendChild(thisCart.element);

      thisCart.products.push(new CartProduct(menuProduct, thisCart.element));
      //console.log('thisCart.products', thisCart.products);

      thisCart.update();
    }

    update() {
      const thisCart = this;

      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for(let product of thisCart.products) {
        thisCart.subtotalPrice += product.price;
        thisCart.totalNumber += product.amount;
      }

      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      console.log('totalNumber', thisCart.totalNumber);
      console.log('subtotalPrice', thisCart.subtotalPrice);

      for(let key of thisCart.renderTotalsKeys) {
        for(let elem of thisCart.dom[key]) {
          elem.innerHTML = thisCart[key];
        }
      }

    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.amountWidget = thisCart.dom.wrapper.querySelector(select.cart.AmountWidget);

      thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

      for(let key of thisCart.renderTotalsKeys){
        thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      }
    }
  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();

      //console.log('thisCartProduct', thisCartProduct);
    }

    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('update', function(){
        thisCartProduct.processOrder();
      });
    }

    processOrder() {
      const thisCartProduct = this;

      /* [DONE] create variable with actual cart product amount */
      const actualAmount = thisCartProduct.amountWidget.value;
      //console.log('actualAmount', actualAmount);

      /* [DONE] calculate new price based on the actual cart product amount */
      thisCartProduct.price = actualAmount * thisCartProduct.priceSingle;
      //console.log('newPrice', thisCartProduct.price);

      /* [DONE] Add new price to DOM element */
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

    }

    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }
  }

  const app = {
    initMenu: function() {
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function() {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
  };

  app.init();
}
