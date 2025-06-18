document.addEventListener('DOMContentLoaded', function() {
    // Initialize borrowings from localStorage or use default data
    if (!localStorage.getItem('borrowings')) {
        const defaultBorrowings = [
            {
                id: 1,
                bookId: 1,
                borrowerId: 1,
                borrowDate: '2024-01-15',
                dueDate: '2024-01-29',
                returnDate: null,
                status: 'borrowed'
            },
            {
                id: 2,
                bookId: 2,
                borrowerId: 2,
                borrowDate: '2024-01-10',
                dueDate: '2024-01-24',
                returnDate: null,
                status: 'overdue'
            }
        ];
        localStorage.setItem('borrowings', JSON.stringify(defaultBorrowings));
    }

    // Load and display borrowings
    loadBorrowings();

    // Add event listeners
    document.getElementById('search').addEventListener('input', filterBorrowings);
    document.getElementById('status').addEventListener('change', filterBorrowings);
    document.getElementById('dateRange').addEventListener('change', filterBorrowings);
    document.getElementById('borrowForm').addEventListener('submit', handleBorrowSubmit);

    // Initialize filter state
    window.filterState = {
        search: '',
        status: '',
        dateRange: ''
    };

    // Populate book and borrower select dropdowns
    populateDropdowns();
});

// Load and display borrowings
function loadBorrowings() {
    const borrowings = JSON.parse(localStorage.getItem('borrowings')) || [];
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const borrowers = JSON.parse(localStorage.getItem('borrowers')) || [];
    const tableBody = document.getElementById('dueDatesTableBody');
    tableBody.innerHTML = '';

    borrowings.forEach(borrowing => {
        if (matchesFilters(borrowing)) {
            const book = books.find(b => b.id === borrowing.bookId);
            const borrower = borrowers.find(b => b.id === borrowing.borrowerId);
            
            if (book && borrower) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${book.title}</div>
                        <div class="text-sm text-gray-500">ISBN: ${book.isbn}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${borrower.name}</div>
                        <div class="text-sm text-gray-500">${borrower.memberId}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${formatDate(borrowing.borrowDate)}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${formatDate(borrowing.dueDate)}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(borrowing.status)}">
                            ${borrowing.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ${
                            borrowing.status === 'returned' ? 
                            `<span class="text-gray-500">Returned on ${formatDate(borrowing.returnDate)}</span>` :
                            `<button onclick="showReturnConfirmation(${borrowing.id})" class="text-green-600 hover:text-green-900">
                                <i class="fas fa-check-circle"></i> Return
                            </button>`
                        }
                    </td>
                `;
                tableBody.appendChild(row);
            }
        }
    });

    updateBorrowingStatus();
}

// Update borrowing status based on due dates
function updateBorrowingStatus() {
    const borrowings = JSON.parse(localStorage.getItem('borrowings')) || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updatedBorrowings = borrowings.map(borrowing => {
        if (borrowing.status !== 'returned') {
            const dueDate = new Date(borrowing.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            
            if (today > dueDate) {
                borrowing.status = 'overdue';
            }
        }
        return borrowing;
    });

    localStorage.setItem('borrowings', JSON.stringify(updatedBorrowings));
}

// Filter borrowings based on search, status, and date range
function filterBorrowings() {
    const searchInput = document.getElementById('search');
    const statusSelect = document.getElementById('status');
    const dateRangeSelect = document.getElementById('dateRange');

    window.filterState = {
        search: searchInput.value.toLowerCase(),
        status: statusSelect.value,
        dateRange: dateRangeSelect.value
    };

    loadBorrowings();
}

// Check if a borrowing matches the current filters
function matchesFilters(borrowing) {
    const { search, status, dateRange } = window.filterState;
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const borrowers = JSON.parse(localStorage.getItem('borrowers')) || [];
    
    const book = books.find(b => b.id === borrowing.bookId);
    const borrower = borrowers.find(b => b.id === borrowing.borrowerId);
    
    // Search filter
    const matchesSearch = !search || 
        (book && book.title.toLowerCase().includes(search)) ||
        (borrower && borrower.name.toLowerCase().includes(search));
    
    // Status filter
    const matchesStatus = !status || borrowing.status === status;
    
    // Date range filter
    const matchesDateRange = checkDateRange(borrowing.borrowDate, dateRange);

    return matchesSearch && matchesStatus && matchesDateRange;
}

// Check if a date falls within the selected range
function checkDateRange(dateStr, range) {
    if (!range) return true;

    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (range) {
        case 'today':
            return date.toDateString() === today.toDateString();
        case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return date >= weekAgo && date <= today;
        case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            return date >= monthAgo && date <= today;
        default:
            return true;
    }
}

// Populate book and borrower select dropdowns
function populateDropdowns() {
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const borrowers = JSON.parse(localStorage.getItem('borrowers')) || [];
    const bookSelect = document.getElementById('bookSelect');
    const borrowerSelect = document.getElementById('borrowerSelect');

    // Populate books dropdown
    bookSelect.innerHTML = '<option value="">Select Book</option>';
    books.filter(book => book.status === 'available').forEach(book => {
        const option = document.createElement('option');
        option.value = book.id;
        option.textContent = `${book.title} (${book.isbn})`;
        bookSelect.appendChild(option);
    });

    // Populate borrowers dropdown
    borrowerSelect.innerHTML = '<option value="">Select Borrower</option>';
    borrowers.filter(borrower => borrower.status === 'active').forEach(borrower => {
        const option = document.createElement('option');
        option.value = borrower.id;
        option.textContent = `${borrower.name} (${borrower.memberId})`;
        borrowerSelect.appendChild(option);
    });
}

// Show Borrow Modal
function showBorrowModal() {
    document.getElementById('borrowForm').reset();
    
    // Set minimum dates for borrow and due date inputs
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('borrowDate').min = today;
    document.getElementById('borrowDate').value = today;
    
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
    document.getElementById('dueDate').min = today;
    document.getElementById('dueDate').value = twoWeeksLater.toISOString().split('T')[0];

    document.getElementById('borrowModal').classList.remove('hidden');
}

// Hide Borrow Modal
function hideBorrowModal() {
    document.getElementById('borrowModal').classList.add('hidden');
    document.getElementById('borrowForm').reset();
}

// Handle Borrow Form Submit
function handleBorrowSubmit(e) {
    e.preventDefault();
    
    const bookId = parseInt(document.getElementById('bookSelect').value);
    const borrowerId = parseInt(document.getElementById('borrowerSelect').value);
    const borrowDate = document.getElementById('borrowDate').value;
    const dueDate = document.getElementById('dueDate').value;

    // Validate dates
    if (new Date(dueDate) <= new Date(borrowDate)) {
        window.libraryUtils.showNotification('Due date must be after borrow date', 'error');
        return;
    }

    const borrowing = {
        id: Date.now(),
        bookId,
        borrowerId,
        borrowDate,
        dueDate,
        returnDate: null,
        status: 'borrowed'
    };

    // Update book status
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex !== -1) {
        books[bookIndex].status = 'borrowed';
        localStorage.setItem('books', JSON.stringify(books));
    }

    // Update borrower's borrowed books count
    const borrowers = JSON.parse(localStorage.getItem('borrowers')) || [];
    const borrowerIndex = borrowers.findIndex(b => b.id === borrowerId);
    if (borrowerIndex !== -1) {
        borrowers[borrowerIndex].borrowedBooks++;
        localStorage.setItem('borrowers', JSON.stringify(borrowers));
    }

    // Save borrowing
    const borrowings = JSON.parse(localStorage.getItem('borrowings')) || [];
    borrowings.push(borrowing);
    localStorage.setItem('borrowings', JSON.stringify(borrowings));

    hideBorrowModal();
    loadBorrowings();
    window.libraryUtils.showNotification('Book borrowed successfully!', 'success');
}

// Show Return Confirmation Modal
function showReturnConfirmation(borrowingId) {
    const returnModal = document.getElementById('returnModal');
    returnModal.classList.remove('hidden');
    
    const confirmReturnBtn = document.getElementById('confirmReturn');
    confirmReturnBtn.onclick = () => returnBook(borrowingId);
}

// Hide Return Modal
function hideReturnModal() {
    document.getElementById('returnModal').classList.add('hidden');
}

// Return Book
function returnBook(borrowingId) {
    const borrowings = JSON.parse(localStorage.getItem('borrowings')) || [];
    const borrowingIndex = borrowings.findIndex(b => b.id === borrowingId);
    
    if (borrowingIndex !== -1) {
        const borrowing = borrowings[borrowingIndex];
        borrowing.status = 'returned';
        borrowing.returnDate = new Date().toISOString().split('T')[0];

        // Update book status
        const books = JSON.parse(localStorage.getItem('books')) || [];
        const bookIndex = books.findIndex(b => b.id === borrowing.bookId);
        if (bookIndex !== -1) {
            books[bookIndex].status = 'available';
            localStorage.setItem('books', JSON.stringify(books));
        }

        // Update borrower's borrowed books count
        const borrowers = JSON.parse(localStorage.getItem('borrowers')) || [];
        const borrowerIndex = borrowers.findIndex(b => b.id === borrowing.borrowerId);
        if (borrowerIndex !== -1) {
            borrowers[borrowerIndex].borrowedBooks--;
            localStorage.setItem('borrowers', JSON.stringify(borrowers));
        }

        localStorage.setItem('borrowings', JSON.stringify(borrowings));
        hideReturnModal();
        loadBorrowings();
        window.libraryUtils.showNotification('Book returned successfully!', 'success');
    }
}

// Get status class for styling
function getStatusClass(status) {
    switch (status) {
        case 'borrowed':
            return 'bg-blue-100 text-blue-800';
        case 'overdue':
            return 'bg-red-100 text-red-800';
        case 'returned':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Format date for display
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}