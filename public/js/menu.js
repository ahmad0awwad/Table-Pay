document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded');

   
    const categoriesContainer = document.getElementById('categories-container');
    const productsContainer = document.getElementById('products-container');

    if (!categoriesContainer || !productsContainer) {
        console.error('Required containers not found.');
        return;
    }

    let menuData = null;
    let isScrolling = false; // Flag to prevent conflicts between scroll and click

    const fetchMenuData = async () => {
        try {
            console.log('Fetching menu data...');
            const response = await fetch('/api/menu');
            if (!response.ok) throw new Error('Failed to fetch menu data');

            const data = await response.json();
            console.log('Fetched menu data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching menu data:', error);
            return null;
        }
    };

    const renderCategories = (categories) => {
        console.log('Rendering categories:', categories);
        categoriesContainer.innerHTML = '';

        categories.forEach((category, index) => {
            const categoryElement = document.createElement('div');
            categoryElement.classList.add('category');
            if (index === 0) categoryElement.classList.add('active'); // Set the first category as active initially
            categoryElement.textContent = category.name;

            // Scroll to the category section when clicked
            categoryElement.addEventListener('click', () => {
                console.log(`Category clicked: ${category.name}`);
                const categoryTitle = document.getElementById(`category-${category._id}`);
                if (categoryTitle) {
                    isScrolling = true; // Disable scroll event temporarily
                    categoryTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setActiveCategory(index); // Mark as active when clicked
                    setTimeout(() => (isScrolling = false), 500); // Re-enable scroll after animation
                }
            });

            categoriesContainer.appendChild(categoryElement);
        });
    };

    const renderProducts = (categories) => {
        console.log('Rendering all products grouped by category:', categories);
        const productsContainer = document.getElementById('products-container');
        const urlParams = new URLSearchParams(window.location.search);
        const tableNumber = urlParams.get('table') || localStorage.getItem('tableNumber');
    
        if (!tableNumber) {
            alert('Table number is missing! Redirecting to the menu.');
            window.location.href = `menu.html?table=${tableNumber}`;
            return;
        }
    
        productsContainer.innerHTML = '';
    
        categories.forEach((category) => {
            // Add a category title
            const categoryTitle = document.createElement('h2');
            categoryTitle.textContent = category.name;
            categoryTitle.classList.add('category-title');
            categoryTitle.id = `category-${category._id}`;
            productsContainer.appendChild(categoryTitle);
    
            // Render the products under this category
            category.products.forEach((product) => {
                const productElement = document.createElement('div');
                productElement.classList.add('product');
    
                productElement.innerHTML = `
                    <img src="${product.Picture || '/css/m.png'}" alt="${product.name}">
                    <div class="product-details">
                        <a href="list.html?productId=${product._id}&table=${tableNumber}" class="product-title">
                            ${product.name}
                        </a>
                        <div class="product-price">${product.price}</div>
                    </div>
                    <div class="quantity-control">
                        <button class="btn decrement">-</button>
                        <span class="quantity">1</span>
                        <button class="btn increment">+</button>
                    </div>
                    <button 
                        class="btn add-to-cart" 
                        data-id="${product._id}" 
                        data-name="${product.name}" 
                        data-price="${product.price}" 
                        data-picture="${product.Picture}">
                        Add to Cart
                    </button>
                `;
                productsContainer.appendChild(productElement);
            });
        });
    
        // Add event listeners for quantity controls and cart
        document.querySelectorAll('.product').forEach(product => {
            const decrementBtn = product.querySelector('.decrement');
            const incrementBtn = product.querySelector('.increment');
            const quantitySpan = product.querySelector('.quantity');
            const addToCartBtn = product.querySelector('.add-to-cart');
    
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
    
            addToCartBtn.addEventListener('click', () => {
                const id = addToCartBtn.dataset.id;
                const name = addToCartBtn.dataset.name;
                const price = parseFloat(addToCartBtn.dataset.price.replace(/[^\d.]/g, '')) || 0;
                const quantity = parseInt(quantitySpan.textContent, 10);
                const picture = addToCartBtn.dataset.picture || 'images/m.png';
    
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const existingItemIndex = cart.findIndex(item => item.id === id);
    
                if (existingItemIndex !== -1) {
                    cart[existingItemIndex].quantity = quantity;
                } else {
                    cart.push({ id, name, price, quantity, picture });
                }
    
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
            });
        });
    };
    





  

    
    

    const setActiveCategory = (index) => {
        const categories = document.querySelectorAll('.category');
        if (index < 0 || index >= categories.length) return;

        // Update the active category
        categories.forEach((category, i) => {
            if (i === index) {
                category.classList.add('active');
            } else {
                category.classList.remove('active');
            }
        });
    };

    const highlightCategoryOnScroll = () => {
        if (isScrolling) return; // Skip if scrolling is disabled
        const categoryTitles = document.querySelectorAll('.category-title');
        const categories = document.querySelectorAll('.category');
        let activeIndex = -1;

        categoryTitles.forEach((title, index) => {
            const rect = title.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                activeIndex = index; // Detect which category is in view
            }
        });

        if (activeIndex !== -1) {
            setActiveCategory(activeIndex); // Update the active category
        }
    };
    // Attach scroll event to highlight the active category
    productsContainer.addEventListener('scroll', () => {
        highlightCategoryOnScroll();
    });

    // Fetch and render menu data
    menuData = await fetchMenuData();
    if (menuData && menuData.categories) {
        renderCategories(menuData.categories); // Render the category tabs
        renderProducts(menuData.categories); // Render all products stacked by category
        setActiveCategory(0); // Ensure the first category is active initially
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded');

    const urlParams = new URLSearchParams(window.location.search);
    const tableNumber = urlParams.get('table');

    if (!tableNumber) {
        alert('Table number is missing! Redirecting to the home page.');
        window.location.href = '/';
    } else {
        // Save the actual table number in localStorage
        localStorage.setItem('tableNumber', tableNumber);

        // Dynamically update the cart link
        const cartLink = document.querySelector('#cart-icon a');
        cartLink.href = `cart.html?table=${tableNumber}`;
    }
    updateCartCount();

});







// document.querySelector('#Clear').addEventListener('click', function (event) {
//      event.preventDefault();

//     localStorage.removeItem('cart');
//     updateCartCount()
// });
$(window).scroll(function() {
    if ($(this).scrollTop() >= 50) {
        $('#return-to-top').fadeIn(200);
    } else {
        $('#return-to-top').fadeOut(200);
    }
});


$('#return-to-top').click(function() {
    $('body,html').animate({
        scrollTop: 0
    }, 500);
});



// Function to get cart items from localStorage
function getCartItems() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function addToCart(product) {
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    const existingIndex = cartItems.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
        cartItems[existingIndex].quantity = product.quantity;
        } else {

            cartItems.push(product);
    }

    // Save the updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));

    console.log("Cart updated:", cartItems); // Debug log for localStorage
    updateCartCount();
}





function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

    const cartCountElement = document.querySelector('#cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalQuantity;
    }
}

document.addEventListener('DOMContentLoaded', updateCartCount);




document.querySelector('#addToCartButton').addEventListener('click', function () {
    // Fetch the active slide image or fallback to placeholder
    const activeSlide = document.querySelector('.swiper-slide-active img');

    // Fetch the product details from the DOM
    const rawPrice = document.getElementById('product-price').textContent.trim();
    const quantity = parseInt(document.querySelector('.quantity-input').value, 10) || 1;

    const product = {
        id: document.getElementById('product-id').value || 'unknown-id',
        name: document.getElementById('product-title').textContent.trim() || 'Unknown Product',
        price: parseFloat(rawPrice.replace(/[^\d.]/g, '')) || 0, // Extract and parse the price
        quantity:quantity,
        Picture: document.getElementById('product.Picture'), // Assign the image source here
    };

    console.log("Adding product to cart:", product); // Debug log
    addToCart(product);
});






// Initialize cart counter on page load
window.onload = function () {
    updateCartCount();
};



