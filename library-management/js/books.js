document.addEventListener('DOMContentLoaded', function() {
    // Initialize books from localStorage or use default data
    if (!localStorage.getItem('books')) {
        const defaultBooks = [
            {
                id: 1,
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                isbn: "978-0743273565",
                category: "fiction",
                status: "available"
            },
            {
                id: 2,
                title: "Clean Code",
                author: "Robert C. Martin",
                isbn: "978-0132350884",
                category: "technology",
                status: "borrowed"
            }
        ];
        localStorage.setItem('books', JSON.stringify(defaultBooks));
    }

    // Load and display books
    loadBooks();

    // Add event listeners
    document.getElementById('search').addEventListener('input', filterBooks);
    document.getElementById('category').addEventListener('change', filterBooks);
    document.getElementById('availability').addEventListener('change', filterBooks);
    document.getElementById('bookForm').addEventListener('submit', handleBookSubmit);

    // Initialize filter state
    window.filterState = {
        search: document.getElementById('search').value.toLowerCase(),
        category: document.getElementById('category').value,
        availability: document.getElementById('availability').value
    };
});

// Load and display books
function loadBooks() {
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const tableBody = document.getElementById('booksTableBody');
    tableBody.innerHTML = '';

    books.forEach(book => {
        if (matchesFilters(book)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${book.title}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${book.author}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${book.isbn}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 capitalize">${book.category}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        book.status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }">
                        ${book.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editBook(${book.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="showDeleteConfirmation(${book.id})" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        }
    });
}

// Filter books based on search, category, and availability
function filterBooks() {
    const searchInput = document.getElementById('search');
    const categorySelect = document.getElementById('category');
    const availabilitySelect = document.getElementById('availability');

    window.filterState = {
        search: searchInput.value.toLowerCase(),
        category: categorySelect.value,
        availability: availabilitySelect.value
    };

    loadBooks();
}

// Check if a book matches the current filters
function matchesFilters(book) {
    const { search, category, availability } = window.filterState || { search: '', category: '', availability: '' };
    
    const matchesSearch = !search || 
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search) ||
        book.isbn.toLowerCase().includes(search);
    
    const matchesCategory = !category || book.category === category;
    const matchesAvailability = !availability || book.status === availability;

    return matchesSearch && matchesCategory && matchesAvailability;
}

// Show Add Book Modal
function showAddBookModal() {
    document.getElementById('modalTitle').textContent = 'Add New Book';
    document.getElementById('bookForm').reset();
    document.getElementById('bookForm').dataset.mode = 'add';
    document.getElementById('bookModal').classList.remove('hidden');
}

// Show Edit Book Modal
function editBook(bookId) {
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const book = books.find(b => b.id === bookId);
    
    if (book) {
        document.getElementById('modalTitle').textContent = 'Edit Book';
        document.getElementById('bookTitle').value = book.title;
        document.getElementById('bookAuthor').value = book.author;
        document.getElementById('bookISBN').value = book.isbn;
        document.getElementById('bookCategory').value = book.category;
        
        document.getElementById('bookForm').dataset.mode = 'edit';
        document.getElementById('bookForm').dataset.bookId = bookId;
        document.getElementById('bookModal').classList.remove('hidden');
    }
}

// Hide Book Modal
function hideBookModal() {
    document.getElementById('bookModal').classList.add('hidden');
    document.getElementById('bookForm').reset();
}

// Handle Book Form Submit
function handleBookSubmit(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('bookTitle').value.trim(),
        author: document.getElementById('bookAuthor').value.trim(),
        isbn: document.getElementById('bookISBN').value.trim(),
        category: document.getElementById('bookCategory').value.toLowerCase(),
        status: 'available'
    };

    // Validate form data
    if (!formData.title || !formData.author || !formData.isbn || !formData.category) {
        window.libraryUtils.showNotification('Please fill in all fields', 'error');
        return;
    }

    const books = JSON.parse(localStorage.getItem('books')) || [];
    const mode = e.target.dataset.mode;

    if (mode === 'add') {
        formData.id = Date.now();
        books.push(formData);
        window.libraryUtils.showNotification('Book added successfully!', 'success');
    } else if (mode === 'edit') {
        const bookId = parseInt(e.target.dataset.bookId);
        const index = books.findIndex(b => b.id === bookId);
        if (index !== -1) {
            books[index] = { ...books[index], ...formData };
            window.libraryUtils.showNotification('Book updated successfully!', 'success');
        }
    }

    localStorage.setItem('books', JSON.stringify(books));
    hideBookModal();
    loadBooks();
}

// Show Delete Confirmation Modal
function showDeleteConfirmation(bookId) {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.classList.remove('hidden');
    
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    confirmDeleteBtn.onclick = () => deleteBook(bookId);
}

// Hide Delete Modal
function hideDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
}

// Delete Book
function deleteBook(bookId) {
    let books = JSON.parse(localStorage.getItem('books')) || [];
    books = books.filter(book => book.id !== bookId);
    localStorage.setItem('books', JSON.stringify(books));
    
    hideDeleteModal();
    loadBooks();
    window.libraryUtils.showNotification('Book deleted successfully!', 'success');
}

// Toggle Book Status
function toggleBookStatus(bookId) {
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const index = books.findIndex(b => b.id === bookId);
    
    if (index !== -1) {
        books[index].status = books[index].status === 'available' ? 'borrowed' : 'available';
        localStorage.setItem('books', JSON.stringify(books));
        loadBooks();
        
        const statusText = books[index].status === 'available' ? 'available' : 'borrowed';
        window.libraryUtils.showNotification(`Book marked as ${statusText}!`, 'success');
    }
}