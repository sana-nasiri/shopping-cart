//Variables
const productsDOM = document.querySelector("#products");
const closeBtn = document.querySelector(".closebtn");
const cartIcon = document.querySelector(".cart-icon");
const clearCartBtn = document.querySelector(".clear-cart");
const cartContent = document.querySelector(".cart-content");
const sideNav = document.querySelector(".side-nav");
const cartTotal = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");

let basketItems = JSON.parse(localStorage.getItem("CART")) || [];
let basketData = JSON.parse(localStorage.getItem("cart"));
let reload = 'true';

//Product class
class Products {
    async getProducts() {
        const response = await fetch("products.json");
        const responseData = await response.json();
        let products = responseData.items;

        products.map((item) => {
            const title = item.title;
            const price = item.price;
            const image = item.image;
            const id = item.id;
            return {
                title,
                price,
                image,
                id,
            };
        });
        return products;
    }
}

//UI class
class UI {
    //show products
    displayProducts(products) {
        this.products = products;
        let output = "";
        products.forEach((product) => {
            output += `
            <div class="col">
            <div class="card text-center h-100">
                <img src=${product.image} class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title ">${product.title}</h5>
                    <p class="card-text text-primary card-price">$${product.price}</p>
                    <a href="#" class="btn btn-primary d-block btn-cart" data-id=${product.id}>Add to cart</a>
                </div>
            </div>
        </div>`;
        });
        productsDOM.innerHTML = output;
    }

    //add to Cart
    addToCart(id) {

        if (basketData !== []) {
            this.generateShopBasket();
        }
        const item = this.products.find((product) => product.id === id);
        if (item) {
            this.addCartItem(item);
            basketItems.push({
                ...item,
                amount: 1,
            });
        }

        productsDOM.addEventListener("click", (e) => {
            if (e.target.classList.contains("btn-cart")) {
                const product = e.target.parentElement.parentElement;
                const list = new Products();
                const item = list.getProducts();
                const idNumber = product.querySelector(".card-body > a").getAttribute("data-id");
                item.then((res) => {
                    for (let x of res) {
                        if (x.id === idNumber) {
                            x.amount = 1;
                            this.addCartItems(x);
                        }
                    }
                });
            }
        });
    }

    //add Cart Items
    addCartItems(product) {
        //set product in LS
        let storage = new Storage();
        storage.setCart(product);
        this.updateSubtotal();
        //create div
        const div = document.createElement("div");
        //add class
        div.classList = "cart-item";
        //content of div
        div.innerHTML = `
        <div class="row align-items-center">
        <div class="col-3">
            <img src=${product.image} class="ms-3">
        </div> 
            <div class="col-7">
                <h5 class="fs-6 title">${product.title}</h5>
                <h6 class="price"> $ ${product.price} </h6>
                <span class="remove-item text-muted" data-id="${product.id}">remove</span>
            </div>
            <div class="col-2">
                <i class="fa fa-chevron-up" data-id="${product.id}" ></i>
                <p class="item-amount">
                ${product.amount}
                </p>
                <i class="fa fa-chevron-down" data-id="${product.id}" ></i>
            </div>
        </div> `;
        //append div 
        cartContent.appendChild(div);
        //show alert
        if (reload === 'false') {
            this.showAlert("Your product added to cart", "alert-success");
        }
    }

    //generate shop Basket
    generateShopBasket() {
        if (basketData) {
            basketData.forEach((product) => {
                this.addCartItems(product);
            });
        }
    }

    // calculate and update subtotal
    updateSubtotal() {
        let totalPrice = 0,
            totalItems = 0;

        basketItems.forEach((item) => {
            totalPrice += item.price * item.amount;
            totalItems += item.amount;
        });

        cartTotal.innerText = parseFloat(totalPrice.toFixed(2));
        cartItems.innerText = totalItems;
    }

    //cart action
    cartAction() {
        //clear all items
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        })

        cartContent.addEventListener('click', e => {
            const storage = new Storage();
            //remove item
            if (e.target.classList.contains('remove-item')) {
                let id = e.target.dataset.id;
                //remove from DOM
                e.target.parentElement.parentElement.remove();
                //remove from LS
                this.removeItem(id);
            } else if (e.target.classList.contains('fa-chevron-up')) {
                //increase number of items
                let id = e.target.dataset.id;
                //find target with id
                let tempItem = basketItems.find(item => item.id === id);
                console.log(tempItem);
                // increase amount
                tempItem.amount = tempItem.amount + 1;
                //update LS with new amount
                storage.updateCart();
                //update text of amount in ui
                e.target.nextElementSibling.textContent = tempItem.amount;
                //update cart values
                this.updateSubtotal();
            } else if (e.target.classList.contains('fa-chevron-down')) {
                //decrease number of items
                let id = e.target.dataset.id;
                //find target with id
                let tempItem = basketItems.find(item => item.id === id);
                // decrease amount
                tempItem.amount = tempItem.amount - 1;
                //validation 
                if (tempItem.amount > 0) {
                    //update LS with new amount
                    storage.updateCart();
                    //update text of amount in ui
                    e.target.previousElementSibling.textContent = tempItem.amount;
                    //update cart values
                    this.updateSubtotal();
                } else {
                    //remove from DOM
                    e.target.parentElement.parentElement.remove();
                    //remove from LS
                    this.removeItem(id);
                }
            }
        })
    }

    //clear cart
    clearCart() {
        let cartItems = basketData.map(item => item.id);
        cartItems.forEach(id => {
            this.removeItem(id);
        });
        //clear from DOM
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }

    }

    //remove item
    removeItem(id) {
        basketData = basketItems.filter(item => item.id !== id);
        const storage = new Storage();
        //set in LS
        storage.removeProduct(basketData);
        basketItems = basketData;
        this.updateSubtotal();
    }

    //show alert
    showAlert(message, className) {
        //create a div
        const div = document.createElement("div");
        //add class name
        div.className = `alert ${className}`;
        //create text node
        div.appendChild(document.createTextNode(message));
        //get parent
        const container = document.querySelector("#container");
        //get product section
        const alert = document.querySelector("#alert");
        //insert div
        container.insertBefore(div, alert);
        //time out for 4s
        setTimeout(function () {
            document.querySelector(".alert").remove();
        }, 4000);
    }
}




//Storage class
class Storage {
    static setProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find((product) => product.id === id);
    }
    setCart(cart) {
        basketItems.push(cart);
        localStorage.setItem("cart", JSON.stringify(basketItems));
    }
    updateCart() {
        localStorage.setItem("cart", JSON.stringify(basketItems));
    }
    removeProduct(newItems) {
        localStorage.removeItem('cart');
        localStorage.setItem("cart", JSON.stringify(newItems));
    }
    static getCart() {
        return localStorage.getItem("cart") ?
            JSON.parse(localStorage.getItem("cart")) : [];
    }
}

//DOM Content loaded event listener
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    //get products
    products
        .getProducts()
        .then((products) => {
            ui.displayProducts(products);
        })
        .then(() => {
            ui.addToCart();
            ui.cartAction();
        }).finally(() => {
            reload = 'false';
        })
        .catch((err) => console.log(err));

});

//off-Canvas event listeners
closeBtn.addEventListener("click", closeNav);
cartIcon.addEventListener("click", openNav);

//open side nav
function openNav() {
    sideNav.style.width = "450px";
    document.body.style.backgroundColor = "rgba(224, 233, 229,0.5)";
}

//close side nav
function closeNav() {
    sideNav.style.width = "0";
    document.body.style.backgroundColor = "white";
}
//close off-canvas when click outside sidenav
document.addEventListener("mouseup", function (event) {
    let insideNavBar = sideNav.contains(event.target);
    if (!insideNavBar) {
        closeNav();
    }
});