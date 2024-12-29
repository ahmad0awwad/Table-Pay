document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
});

// Fetch and display categories and their subcategories
function fetchCategories() {
    const categoriesContainer = document.getElementById('categories-container');
    if (!categoriesContainer) {
        console.error('Element categories-container not found.');
        return;
    }

    // Detect if the page is in Arabic
    const isArabic = document.documentElement.lang === 'ar';

    fetch('/api/categories')
        .then(response => response.json())
        .then(data => {
            const categories = data.categories || [];
            if (!Array.isArray(categories)) {
                console.error('Expected categories to be an array:', categories);
                return;
            }

            let categoriesHtml = '';
            categories.forEach(category => {
                const categoryName = isArabic ? category.name_arabic : category.name;
                categoriesHtml += `
                    <div class="cat-header">
                        <a href="#" data-toggle="collapse" data-target="#category-${category._id}" aria-expanded="false" aria-controls="category-${category._id}">
                            ${categoryName}
                        </a>
                    </div>
                    <div class="collapse multi-collapse" id="category-${category._id}">
                        <ul class="cat-list">
                `;

              

                categoriesHtml += `
                        </ul>
                    </div>
                `;
            });

            categoriesContainer.innerHTML = categoriesHtml;
        })
        .catch(error => console.error('Error fetching categories:', error));
}

const renderProducts = (products) => {
    const productsContainer = document.getElementById('products-container');
    const urlParams = new URLSearchParams(window.location.search);
    const tableNumber = urlParams.get('table') || localStorage.getItem('tableNumber');

    if (!tableNumber) {
        alert('Table number is missing! Redirecting to the menu.');
        window.location.href = `menu.html?table=${tableNumber}`;
        return;
    }

    let productsHtml = '';

    if (products.length > 0) {
        products.forEach((product) => {
            const productName = product.name;
            const productprice = product.price;
            // const productImage = product.Picture || 'placeholder.jpg';
            const productImage = product.Picture ;

            const productId = product._id;

            productsHtml += `
                <div class="product-item" data-id="${productId}">
                    <img src="${productImage}" alt="${productName}" class="img-fluid">
                    <div class="product-details">
                        <h2>${productName}</h2>
                        <p>Price: ${productprice}</p>
                        <a href="list.html?productId=${productId}&table=${tableNumber}" class="product-title">
                            View Details
                        </a>
                    </div>
                </div>
            `;
        });
    } else {
        productsHtml = `<p>No products available in this category.</p>`;
    }

    productsContainer.innerHTML = productsHtml;
};


document.addEventListener('DOMContentLoaded', async () => {
    console.log('list.js loaded');

    const urlParams = new URLSearchParams(window.location.search);
    let tableNumber = urlParams.get('table');

    if (!tableNumber) {
        tableNumber = localStorage.getItem('tableNumber'); // Fallback to localStorage
        if (!tableNumber) {
            alert('Table number is missing! Redirecting to the menu.');
            window.location.href = `menu.html?table=${tableNumber}`;
            return;
        }
    } 
    else {
        localStorage.setItem('tableNumber', tableNumber);

        const backToMenuLink = document.getElementById('back-to-menu');
        if (backToMenuLink) {
            backToMenuLink.href = `menu.html?table=${tableNumber}`;
        }
    }

    console.log('Table Number:', tableNumber);

    const productId = urlParams.get('productId');
    if (!productId) {
        console.error('Product ID not found in URL.');
        document.getElementById('products-container').innerHTML = '<p>Product not found.</p>';
        return;
    }

    try {
        console.log(`Fetching product details for ID: ${productId}`);
        const response = await fetch(`/api/products/${productId}`); // Fetch product details
        if (!response.ok) throw new Error(`Failed to fetch product details. Status: ${response.status}`);

        const product = await response.json();
        console.log('Fetched product:', product);
        displayProductDetails(product);
    } catch (error) {
        console.error('Error fetching product details:', error);
        document.getElementById('products-container').innerHTML = '<p>Error loading product details.</p>';
    }
});


function displayProductDetails(product) {
    const productsContainer = document.getElementById('products-container');
    if (!product) {
        productsContainer.innerHTML = '<p>Product not found.</p>';
        return;
    }

    productsContainer.innerHTML = `
        <div class="product-item">
            <img src="${product.Picture || '/css/m.png'}" alt="${product.name}" class="img-fluid">
            <div class="product-details">
                <h2>${product.name}</h2>
                <p><strong>Price:</strong> ${product.price}</p>
                <p><strong>Description:</strong> ${product.Description_English || 'Description not available'}</p>
                <div class="quantity-control">
                    <button class="btn decrement">-</button>
                    <span class="quantity">1</span>
                    <button class="btn increment">+</button>
                </div>
                <button 
                    class="btn add-to-cart" 
                    data-id="${product._id}" 
                    data-name="${product.name}" 
                    data-price="${product.price}">
                    Add to Cart
                </button>
            </div>
        </div>
    `;

    const decrementBtn = productsContainer.querySelector('.decrement');
    const incrementBtn = productsContainer.querySelector('.increment');
    const quantitySpan = productsContainer.querySelector('.quantity');
    const addToCartBtn = productsContainer.querySelector('.add-to-cart');

    // Update quantity
    decrementBtn.addEventListener('click', () => {
        let quantity = parseInt(quantitySpan.textContent, 10);
        if (quantity > 1) {
            quantity -= 1;
            quantitySpan.textContent = quantity;
        }
    });

    incrementBtn.addEventListener('click', () => {
        let quantity = parseInt(quantitySpan.textContent, 10);
        quantity += 1;
        quantitySpan.textContent = quantity;
    });

    // Add to cart
    addToCartBtn.addEventListener('click', () => {
        const id = addToCartBtn.dataset.id;
        const name = addToCartBtn.dataset.name;
        const price = parseFloat(addToCartBtn.dataset.price) || 0;
        const quantity = parseInt(quantitySpan.textContent, 10);

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(item => item.id === id);

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({ id, name, price, quantity });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${quantity} ${name} added to cart!`);
    });
    //بحيب الداتا االمخزنه في دي بي
    console.log('Fetched product:', product);

}





