document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('orders-container');
    const socket = io();

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

    // Listen for updated orders
    socket.on('order-updated', (updatedOrder) => {
        console.log('Order updated via WebSocket:', updatedOrder);

        // Update the specific order in the DOM
        const orderElement = document.querySelector(`.order[data-id="${updatedOrder._id}"]`);
        if (orderElement) {
            orderElement.querySelector('p:nth-child(5)').innerText = `Status: ${updatedOrder.status}`;
        }
    });

    function renderOrders(orders) {
        ordersContainer.innerHTML = '';
        orders.forEach(order => addOrder(order));
    }

    function addOrder(order) {
        const orderElement = document.createElement('div');
        orderElement.classList.add('order');
        orderElement.setAttribute('data-id', order._id);

        orderElement.innerHTML = `
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Table Number:</strong> ${order.tableNumber}</p>
            <p><strong>Total Amount:</strong> ${order.totalAmount} KD</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <button class="mark-in-progress">Mark as In Progress</button>
            <button class="mark-completed">Mark as Completed</button>
        `;

        orderElement.querySelector('.mark-in-progress').addEventListener('click', function () {
            const button = this;
            button.disabled = true; // Disable the button
            updateOrderStatus(order._id, 'in-progress').finally(() => {
                button.disabled = false; // Re-enable after API call
            });
        });

        orderElement.querySelector('.mark-completed').addEventListener('click', function () {
            const button = this;
            button.disabled = true; // Disable the button
            updateOrderStatus(order._id, 'completed').finally(() => {
                button.disabled = false; // Re-enable after API call
            });
        });

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

                // Update the specific order in the DOM
                const orderElement = document.querySelector(`.order[data-id="${updatedOrder._id}"]`);
                if (orderElement) {
                    orderElement.querySelector('p:nth-child(5)').innerText = `Status: ${updatedOrder.status}`;
                }
            })
            .catch(error => console.error('Error updating order:', error));
    }
});
