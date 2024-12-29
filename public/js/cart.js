document.addEventListener('DOMContentLoaded', function () {
    
    const cartItemsContainer = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('total-amount');
   
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log("Cart contents:", cart);

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<tr><td colspan="5">Your cart is empty</td></tr>';
        totalElement.textContent = '0.00 KD';
        return;
    }

    function updateCartUI() {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const totalElement = document.getElementById('total-amount');
    
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<tr><td colspan="5">Your cart is empty</td></tr>';
            totalElement.textContent = '0.00 KD';
            return;
        }
        cart.forEach((item, index) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity, 10) || 1;
            const totalPrice = price * quantity;
        
            subtotal += totalPrice;

            const cartRow = `
                <tr>
                    <td>
                <img src="${item.Picture || 'css/m.png'}" alt="${item.name}" class="img-thumbnail" width="50">
                    </td>
                    <td>${item.name || 'Unknown Product'}</td>
                    <td>${price.toFixed(2)} KD</td>
                    <td>
                        <div class="quantity-container" data-index="${index}">
                            <button class="btn btn-sm btn-secondary decrement">-</button>
                            <span class="quantity-display">${quantity}</span>
                            <button class="btn btn-sm btn-secondary increment">+</button>
                        </div>
                    </td>
                    <td>${totalPrice.toFixed(2)} KD</td>
                    <td>
                        <button class="btn btn-danger delete-item" data-index="${index}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        
            cartItemsContainer.insertAdjacentHTML('beforeend', cartRow);
        });

        totalElement.textContent = `${subtotal.toFixed(2)} KD`;
        
        attachEventListeners();
    }

    function attachEventListeners() {
        document.querySelectorAll('.increment').forEach(button => {
            button.addEventListener('click', function () {
                const index = parseInt(this.closest('.quantity-container').dataset.index, 10);
                cart[index].quantity += 1;
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartUI();
            });
        });

        document.querySelectorAll('.decrement').forEach(button => {
            button.addEventListener('click', function () {
                const index = parseInt(this.closest('.quantity-container').dataset.index, 10);
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartUI();
                }
            });
        });

        document.querySelectorAll('.delete-item').forEach(button => {
            button.addEventListener('click', function () {
                const index = parseInt(this.dataset.index, 10);
                
                cart.splice(index, 1);
                
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartUI();
                updateCartCount()
                localStorage.removeItem('index');

            });
        });
    }
   

    updateCartUI();
   
   

});



document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    let tableNumber = urlParams.get('table');

    if (!tableNumber) {
        tableNumber = localStorage.getItem('tableNumber');
    }

    if (!tableNumber) {
        alert('Table number is missing! Redirecting to the menu.');
        window.location.href = `menu.html?table=${tableNumber}`;
        return;
    }

    // Save the table number in localStorage
    localStorage.setItem('tableNumber', tableNumber);
    const backToMenuLink = document.querySelector('.back-to-menu');
    if (backToMenuLink) {
        backToMenuLink.href = `menu.html?table=${tableNumber}`;
    }
    // Update the "Proceed" button to include the table number
    const proceedButton = document.getElementById('proceed-to-gateway');
    proceedButton.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default anchor behavior
        const targetUrl = `getway.html?table=${tableNumber}`;
        window.location.href = targetUrl;
    });

    // Debugging: Check tableNumber
    console.log("Table number:", tableNumber);
});



function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    console.log("Updating cart count. Current cart:", cartItems);

    const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    console.log("Total cart items:", totalQuantity);

    const cartCountElement = document.querySelector('#cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalQuantity;
    }
}

document.addEventListener('DOMContentLoaded', updateCartCount);

    
        $("input[type='number']").inputSpinner()
       