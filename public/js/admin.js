document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('orders-container');
    const socket = io(); // Connect to the Socket.IO server
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    // Fetch initial orders
    fetch('/api/orders')
        .then(response => response.json())
        .then(orders => renderOrders(orders))
        .catch(error => console.error('Error fetching orders:', error));

    // Listen for new orders
    socket.on('newOrder', (order) => {
        console.log('New order received:', order);
        addOrder(order);
    });

    function renderOrders(orders) {
        ordersContainer.innerHTML = '';
        orders.forEach(order => addOrder(order));
    }

    function addOrder(order) {
        const orderElement = document.createElement('div');
        orderElement.classList.add('order');

        orderElement.innerHTML = `
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Table Number:</strong> ${order.tableNumber}</p>
            <p><strong>Total Amount:</strong> ${order.totalAmount} KD</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <button class="mark-in-progress" data-id="${order._id}">Mark as In Progress</button>
            <button class="mark-completed" data-id="${order._id}">Mark as Completed</button>
        `;

        // Attach event listeners for status buttons
        orderElement.querySelector('.mark-in-progress').addEventListener('click', () => updateOrderStatus(order._id, 'in-progress'));
        orderElement.querySelector('.mark-completed').addEventListener('click', () => updateOrderStatus(order._id, 'completed'));

        ordersContainer.appendChild(orderElement);
    }

    function updateOrderStatus(orderId, status) {
        fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        })
            .then(response => response.json())
            .then(updatedOrder => {
                console.log('Order updated:', updatedOrder);
                renderOrders(updatedOrder);
            })
            .catch(error => console.error('Error updating order:', error));
    }
});
