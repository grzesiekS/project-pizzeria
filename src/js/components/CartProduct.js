import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

    thisCartProduct.paramsOptionsId(thisCartProduct.params);
    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();

    //console.log('thisCartProduct', thisCartProduct);
  }

  paramsOptionsId(params) {
    const thisCartProduct = this;
    /* [DONE] Create new empty object with id of parameter and option */
    thisCartProduct.paramsId = {};

    /*START LOOP: for all parameters in params*/
    for(let param in params) {
      /* [DONE] Create const with param id*/
      const paramId = params[param].options;

      /*[DONE] Add paramId to new object */
      thisCartProduct.paramsId[param] = {
        //optId: {},
      };
      /*START LOOP: for all options in param*/
      for(let opt in paramId){
        /* [DONE] Add id of an options to new object*/
        thisCartProduct.paramsId[param][opt] = opt;

      /*END LOOP: for all options in param*/
      }
    /*END LOOP: for all parameters in params*/
    }
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

  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
    //console.log('remove thisCartProduct', thisCartProduct);
  }

  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(){
      event.preventDefault();
    });

    thisCartProduct.dom.remove.addEventListener('click', function(){
      event.preventDefault();
      thisCartProduct.remove();
    });

  }

  getData() {
    const thisCartProduct = this;
    const CartProductData ={
      id: thisCartProduct.id,
      amount: parseInt(thisCartProduct.dom.actualAmount.value),
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      params: thisCartProduct.paramsId,
    };

    return CartProductData;
  }

  getElements(element) {
    const thisCartProduct = this;

    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.actualAmount = thisCartProduct.dom.amountWidget.querySelector('.amount');
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
  }
}

export default CartProduct;
