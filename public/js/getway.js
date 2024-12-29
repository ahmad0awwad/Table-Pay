const THRESHOLD_AMOUNT = 200;

document.addEventListener('DOMContentLoaded', function() {
    console.error('DOM fully loaded and parsed');
    loadCartData();
    updateCartCount();
    document.getElementById('getway-form').addEventListener('submit', function(event) {

        if (!validateForm()) {
            event.preventDefault();
        }
    });

    
});

// document.addEventListener('DOMContentLoaded', function () {
   
//     if (tableInfoElement) {
//         tableInfoElement.textContent = `Table: ${tableNumber}`;
//     }
//     const theOrder = document.getElementById('theOrder');
//     const subtotalElement = document.getElementById('subtotal-amount');
//     const totalElement = document.getElementById('total-amount');
//     const cart = JSON.parse(localStorage.getItem('cart')) || [];
//     const THRESHOLD_AMOUNT = 200; // Define your threshold amount for ID requirements

//     if (cart.length === 0) {
//         theOrder.innerHTML = '<tr><td colspan="2">Your cart is empty</td></tr>';
//         subtotalElement.textContent = '0 KD';
//         totalElement.textContent = '0 KD';
//         return;
//     }

//     let subtotal = 0;
//     let orderHtml = '';

//     cart.forEach(item => {
//         const price = parseFloat(item.price) || 0; // Use parseFloat to support decimals
//         const quantity = parseInt(item.quantity, 10) || 1; // Default quantity to 1 if missing
//         const totalPrice = price * quantity;
    
//         subtotal += totalPrice;
    
//         // Generate HTML for each item in the order summary
//         orderHtml += `
//             <tr>
//                 <td>${item.name} x ${quantity}</td>
//                 <td>${totalPrice.toFixed(2)} KD</td>
//             </tr>
//         `;
//     });
    

//     // Generate HTML for subtotal and total
//     orderHtml += `
//     <tr>
//         <td>Subtotal</td>
//         <td>${subtotal.toFixed(2)} KD</td>
//     </tr>
//     <tr>
//         <td>Total</td>
//         <td class="total">${subtotal.toFixed(2)} KD</td>
//     </tr>
// `;


//     // Update the DOM elements with the calculated values
//     theOrder.innerHTML = orderHtml;
//     subtotalElement.textContent = `${subtotal.toLocaleString()} KD`;
//     totalElement.textContent = `${subtotal.toLocaleString()} KD`;

 
// });

document.addEventListener('DOMContentLoaded', function () {
    console.log("Gateway page loaded.");

    const urlParams = new URLSearchParams(window.location.search);
    let tableNumber = urlParams.get('table');
    console.log("URL tableNumber:", tableNumber);

    if (!tableNumber) {
        tableNumber = localStorage.getItem('tableNumber');
        console.log("Fallback to localStorage tableNumber:", tableNumber);
    }

    if (!tableNumber) {
        console.error("Table number is missing.");
        alert('Table number is missing! Redirecting to the cart.');
        window.location.href = 'cart.html';
        return;
    }

    console.log("Final tableNumber to use:", tableNumber);

    // Save and display the table number
    localStorage.setItem('tableNumber', tableNumber);
    const tableInfoElement = document.getElementById('table-info');
    if (tableInfoElement) {
        tableInfoElement.textContent = `Table: ${tableNumber}`;
    } else {
        console.error("Element with ID 'table-info' not found.");
    }
    // Load and display cart data
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const theOrder = document.getElementById('theOrder');
    if (!cart.length) {
        theOrder.innerHTML = '<tr><td colspan="2">Your cart is empty</td></tr>';
        return;
    }

    let subtotal = 0;
    let orderHtml = '';

    cart.forEach(item => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity, 10) || 1;
        const totalPrice = price * quantity;

        subtotal += totalPrice;

        orderHtml += `
            <tr>
                <td>${item.name} x ${quantity}</td>
                <td>${totalPrice.toFixed(2)} KD</td>
            </tr>
        `;
    });

    // Add subtotal and total rows
    orderHtml += `
        <tr>
            <td>Subtotal</td>
            <td>${subtotal.toFixed(2)} KD</td>
        </tr>
        <tr>
            <td>Total</td>
            <td class="total">${subtotal.toFixed(2)} KD</td>
        </tr>
    `;

    // Inject the order HTML into the table
    theOrder.innerHTML = orderHtml;
    console.log(localStorage.getItem('tableNumber')); // Should log "1"

});



document.getElementById('getway-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const tableNumber = localStorage.getItem('tableNumber') || 'Unknown';
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    const orderId = Math.random().toString(36).substring(2, 10).toUpperCase(); // Generate random order ID
    const date = new Date().toLocaleDateString();

    // Calculate total amount and prepare items array
    let totalAmount = 0;
    const items = cart.map(item => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity, 10) || 0;
        totalAmount += price * quantity;

        return {
            productId: item.id, // Include product ID for backend processing
            name: item.name,
            quantity: quantity,
            price: price
        };
    });

    if (!cart.length) {
        alert('Your cart is empty! Please add items before placing an order.');
        return;
    }

    if (!tableNumber) {
        alert('Table number is missing! Please return to the menu and select your table.');
        return;
    }

    // Create order data
    const orderData = {
        orderId: orderId,
        tableNumber: tableNumber,
        items: items,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        date: date
    };

    console.log('Order data to be sent:', orderData);

    try {
        // Send the order to the backend
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to place the order');
        }

        const result = await response.json();
        console.log('Order successfully placed:', result);

        // Save receipt data to localStorage for final.html
        localStorage.setItem('receiptData', JSON.stringify(orderData));

        // Redirect to the final receipt page
        window.location.href = 'final.html';
    } catch (error) {
        console.error('Error placing the order:', error);
        alert(`Error: ${error.message}`);
    }
});







function validateForm() {
    console.error('Validating form');
    let isValid = true;
    const fields = document.querySelectorAll('.form-control');
    let firstInvalidField = null;

    fields.forEach(field => {
        field.style.borderColor = '';
        field.removeAttribute('title');
    });

    function scrollToField(field, message) {
        if (!firstInvalidField) {
            console.error(`Invalid field: ${field.id}, Reason: ${message}`);
            firstInvalidField = field;
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            field.focus();
            field.style.borderColor = 'red';
            field.setAttribute('title', message);
        }
    }

    const totalAmount = parseFloat(document.querySelector('.total').textContent.replace(' KD', ''));

    if (totalAmount <= 0) {
        isValid = false;
        alert("Total amount must be greater than 0 KD.");
    }

    if (firstInvalidField) {
        console.error('Form validation failed. First invalid field: ', firstInvalidField.id);
        return false;
    }

    console.error('Form validation passed');
    return isValid;
}


