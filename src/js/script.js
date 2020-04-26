/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
        max: 'data-max',
        min: 'data-min',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      console.log('new Product:', thisProduct);
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
      ////console.log('clickableElement:',clickableElement);

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
      });

    }

    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData:', formData);

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
      actualPrice *= thisProduct.amountWidget.value;

      /*[DONE] Add new price for the product */
      thisProduct.priceElem.innerHTML = actualPrice;

    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('update', function(){
        thisProduct.processOrder();
      });
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

      thisWidget.input.value = thisWidget.minValue;
      console.log('thisWidget.value', thisWidget.value);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element);
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
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
