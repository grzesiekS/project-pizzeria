import {templates, utils, select, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';

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
      thisProduct.defaultProductOption();
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

  defaultProductOption() {
    const thisProduct = this;

    /* START LOOP: for all params of the selected product */
    for(let param in thisProduct.data.params) {
      /* [DONE] create const with all options of the selected product */
      const optProdct = thisProduct.data.params[param];

      /* START LOOP: for all options in params of the selected product */
      for(let opt in optProdct.options) {

        /* [DONE] create variable with html element input and select which value equals option of the parameter*/
        const inputElement = thisProduct.element.querySelector('[value="'+ opt +'"]');

        /* START: If option is default */
        if(optProdct.options[opt].default && inputElement != null) {
          /* [DONE] change input element to checked*/
          inputElement.checked = true;
          inputElement.selected = true;
        /* ELSE */
        } else if(!optProdct.options[opt].default && inputElement != null) {
          /* [DONE] uncheck input element */
          inputElement.checked = false;

        /* END: If option is default */
        }
      /* END LOOP: for all options in params of the selected product */
      }
    /* END LOOP: for all params of the selected product*/
    }

    /* [DONE] change quantity amount to min */
    thisProduct.amountInput.value = parseInt(thisProduct.amountInput.getAttribute(select.widgets.amount.min));
    thisProduct.initAmountWidget();

    /*[DONE] run function process order */
    thisProduct.processOrder();
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
    thisProduct.amountInput = thisProduct.amountWidgetElem.querySelector('.amount');
  }
}

export default Product;
