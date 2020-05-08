import {select, settings, templates, classNames} from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';

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

    thisCart.dom.productList.addEventListener('update', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(){
      event.preventDefault();
      thisCart.sendOrder();
    });

    thisCart.dom.cartOrderWrapper.addEventListener('change', function(){
      thisCart.checkAddress();
      thisCart.checkPhoneNumber();
    });
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;

    if(thisCart.checkPhoneNumber() && thisCart.checkAddress()) {
      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        totalNumber: thisCart.totalNumber,
        subtotalPrice: thisCart.subtotalPrice,
        deliveryFee: thisCart.deliveryFee,
        products: [],
      };

      for(let product of thisCart.products) {
        payload.products.push(product.getData());
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options)
        .then(function(response){
          return response.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);
        });
    }

  }

  checkPhoneNumber() {
    const thisCart = this;

    if(thisCart.dom.phone.value.length >= 9) {
      thisCart.dom.phone.classList.remove(classNames.cart.fieldError);
      return true;
    } else {
      thisCart.dom.phone.classList.add(classNames.cart.fieldError);
      return false;
    }
  }

  checkAddress() {
    const thisCart = this;

    if(thisCart.dom.address.value != ''){
      thisCart.dom.address.classList.remove(classNames.cart.fieldError);
      return true;
    } else {
      thisCart.dom.address.classList.add(classNames.cart.fieldError);
      return false;
    }
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
      //thisCart.totalNumber += product.amount;
      thisCart.totalNumber += product.price/product.priceSingle;
    }

    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    //console.log('totalNumber', thisCart.totalNumber);
    //console.log('subtotalPrice', thisCart.subtotalPrice);

    for(let key of thisCart.renderTotalsKeys) {
      for(let elem of thisCart.dom[key]) {
        elem.innerHTML = thisCart[key];
      }
    }

  }

  remove(cartProduct) {
    const thisCart = this;

    /* [DONE] declare const index with cartProduct index */
    const index = thisCart.products.indexOf(cartProduct);
    //console.log('index', index);

    /* [DONE] remove element from products table */
    thisCart.products.splice(index, 1);
    //console.log('Products', thisCart.products);

    /* [DONE] remove DOM element */
    cartProduct.dom.wrapper.remove();

    /* [DONE] update cart section */
    thisCart.update();

    /*START IF: product table length is equal 0 */
    if (thisCart.products.length == 0) {
      /* [DONE] reset cart section */
      thisCart.resetCart();

    /*END IF: product table length is equal 0 */
    }
  }

  resetCart() {
    const thisCart = this;

    for(let key of thisCart.renderTotalsKeys) {
      for(let elem of thisCart.dom[key]) {
        elem.innerHTML = 0;
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

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.cartOrderWrapper = thisCart.dom.wrapper.querySelector('.cart__order-confirmation');
  }
}

export default Cart;
