// Fetch product details based on ID
const productId = new URLSearchParams(window.location.search).get('id');

fetch(`/api/products/${productId}`)
    .then(response => response.json())
    .then(product => {
        if (product) {
            displayProductDetails(product);
        } else {
            document.getElementById('product-container').innerHTML = '<p>Product not found.</p>';
        }
    })
    .catch(error => console.error('Error fetching product data:', error));

function displayProductDetails(product) {
    const productContainer = document.getElementById('product-container');
    const productHtml = `
        <div class="col-md-6">
            <div class="product-gallery">
                <a href="${product.images[0]}" data-lightbox="product-gallery" data-title="${product.name.en}">
                    <img src="${product.images[0]}" id="mainImage" alt="${product.name.en}" class="img-fluid main-image" ondblclick="openGallery()">
                </a>
                <div class="thumbnails">
                    ${product.images.map(image => `
                        <a href="${image}" data-lightbox="product-gallery" data-title="${product.name.en}">
                            <div class="thumbnail"><img src="${image}" alt="${product.name.en}" onclick="changeImage('${image}')"></div>
                        </a>
                    `).join('')}
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="product-info">
                <h1 class="product-title">${product.name.en}</h1>
                <p class="product-price">${product.price} KD</p>
                <p class="product-description">${product.description.en}</p>
                <div class="quantity">
                    <button class="quantity-button" onclick="this.nextElementSibling.stepDown()">-</button>
                    <input type="number" value="1" min="1" max="10" class="quantity-input">
                    <button class="quantity-button" onclick="this.previousElementSibling.stepUp()">+</button>
                </div>
                <div class="btn-container">
                    <button class="btn btn-primary add-to-cart-button" onclick="addToCart('${product._id}')">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
    productContainer.innerHTML = productHtml;
}

function changeImage(src) {
    document.getElementById('mainImage').src = src;
}

function addToCart(productId) {
    fetch(`/api/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            if (product) {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const quantity = document.querySelector('.quantity-input').value;
                const existingProduct = cart.find(item => item._id === product._id);

                if (existingProduct) {
                    existingProduct.quantity += parseInt(quantity, 10);
                } else {
                    cart.push({
                        ...product,
                        quantity: parseInt(quantity, 10)
                    });
                }

                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                // Prompt user for next action
                const userChoice = confirm('Product added to cart! Do you want to go to the cart page? Click OK to go to the cart or Cancel to continue shopping.');
                if (userChoice) {
                    window.location.href = 'cart.html'; // Redirect to the cart page
                }
            }
        })
        .catch(error => console.error('Error fetching product data:', error));
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

document.addEventListener('DOMContentLoaded', function() {
    const productId = new URLSearchParams(window.location.search).get('id');
    fetch(`/api/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            if (product) {
                displayProductDetails(product);
            } else {
                document.getElementById('product-container').innerHTML = '<p>Product not found.</p>';
            }
        })
        .catch(error => console.error('Error fetching product data:', error));
});

function openGallery() {
    lightbox.start(document.querySelector('.product-gallery a[data-lightbox="product-gallery"]'));
}
