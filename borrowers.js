document.addEventListener('DOMContentLoaded', function() {
    // Initialize borrowers from localStorage or use default data
    if (!localStorage.getItem('borrowers')) {
        const defaultBorrowers = [
            {
                id: 1,
                name: "John Doe",
                email: "john.doe@example.com",
                phone: "+1-555-0123",
                address: "123 Library Street, Booktown, BT 12345",
                memberId: "LIB-2024-001",
                status: "active",
                borrowedBooks: 2
            },
            {
                id: 2,
                name: "Jane Smith",
                email: "jane.smith@example.com",
                phone: "+1-555-0124",
                address: "456 Reading Avenue, Booktown, BT 12345",
                memberId: "LIB-2024-002",
                status: "active",
                borrowedBooks: 1
            }
        ];
        localStorage.setItem('borrowers', JSON.stringify(defaultBorrowers));
    }

    // Load and display borrowers
    loadBorrowers();

    // Add event listeners
    document.getElementById('search').addEventListener('input', filterBorrowers);
    document.getElementById('status').addEventListener('change', filterBorrowers);
    document.getElementById('borrowerForm').addEventListener('submit', handleBorrowerSubmit);

    // Initialize filter state
    window.filterState = {
        search: '',
        status: ''
    };
});

// Load and display borrowers
function loadBorrowers() {
    const borrowers = JSON.parse(localStorage.getItem('borrowers')) || [];
    const tableBody = document.getElementById('borrowersTableBody');
    tableBody.innerHTML = '';

    borrowers.forEach(borrower => {
        if (matchesFilters(borrower)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <i class="fas fa-user text-gray-500"></i>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${borrower.name}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${borrower.email}</div>
                    <div class="text-sm text-gray-500">${borrower.phone}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${borrower.memberId}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        borrower.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }">
                        ${borrower.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${borrower.borrowedBooks} books
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editBorrower(${borrower.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="showDeleteConfirmation(${borrower.id})" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        }
    });
}

// Filter borrowers based on search and status
function filterBorrowers() {
    const searchInput = document.getElementById('search');
    const statusSelect = document.getElementById('status');

    window.filterState = {
        search: searchInput.value.toLowerCase(),
        status: statusSelect.value
    };

    loadBorrowers();
}

// Check if a borrower matches the current filters
function matchesFilters(borrower) {
    const { search, status } = window.filterState;
    
    const matchesSearch = borrower.name.toLowerCase().includes(search) ||
                         borrower.email.toLowerCase().includes(search) ||
                         borrower.memberId.toLowerCase().includes(search);
    
    const matchesStatus = !status || borrower.status === status;

    return matchesSearch && matchesStatus;
}

// Generate Member ID
function generateMemberId() {
    const year = new Date().getFullYear();
    const borrowers = JSON.parse(localStorage.getItem('borrowers')) || [];
    const count = borrowers.length + 1;
    return `LIB-${year}-${String(count).padStart(3, '0')}`;
}

// Show Add Borrower Modal
function showAddBorrowerModal() {
    document.getElementById('modalTitle').textContent = 'Add New Borrower';
    document.getElementById('borrowerForm').reset();
    document.getElementById('borrowerForm').dataset.mode = 'add';
    document.getElementById('borrowerModal').classList.remove('hidden');
}

// Show Edit Borrower Modal
function editBorrower(borrowerId) {
    const borrowers = JSON.parse(localStorage.getItem('borrowers')) || [];
    const borrower = borrowers.find(b => b.id === borrowerId);
    
    if (borrower) {
        document.getElementById('modalTitle').textContent = 'Edit Borrower';
        document.getElementById('borrowerName').value = borrower.name;
        document.getElementById('borrowerEmail').value = borrower.email;
        document.getElementById('borrowerPhone').value = borrower.phone;
        document.getElementById('borrowerAddress').value = borrower.address;
        
        document.getElementById('borrowerForm').dataset.mode = 'edit';
        document.getElementById('borrowerForm').dataset.borrowerId = borrowerId;
        document.getElementById('borrowerModal').classList.remove('hidden');
    }
}

// Hide Borrower Modal
function hideBorrowerModal() {
    document.getElementById('borrowerModal').classList.add('hidden');
    document.getElementById('borrowerForm').reset();
}

// Handle Borrower Form Submit
function handleBorrowerSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('borrowerName').value,
        email: document.getElementById('borrowerEmail').value,
        phone: document.getElementById('borrowerPhone').value,
        address: document.getElementById('borrowerAddress').value
    };

    // Validate email format
    if (!window.libraryUtils.validateEmail(formData.email)) {
        window.libraryUtils.showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Validate phone format
    if (!window.libraryUtils.validatePhone(formData.phone)) {
        window.libraryUtils.showNotification('Please enter a valid phone number', 'error');
        return;
    }

    const borrowers = JSON.parse(localStorage.getItem('borrowers')) || [];
    const mode = e.target.dataset.mode;

    if (mode === 'add') {
        formData.id = Date.now();
        formData.memberId = generateMemberId();
        formData.status = 'active';
        formData.borrowedBooks = 0;
        borrowers.push(formData);
        window.libraryUtils.showNotification('Borrower added successfully!', 'success');
    } else if (mode === 'edit') {
        const borrowerId = parseInt(e.target.dataset.borrowerId);
        const index = borrowers.findIndex(b => b.id === borrowerId);
        if (index !== -1) {
            borrowers[index] = { ...borrowers[index], ...formData };
            window.libraryUtils.showNotification('Borrower updated successfully!', 'success');
        }
    }

    localStorage.setItem('borrowers', JSON.stringify(borrowers));
    hideBorrowerModal();
    loadBorrowers();
}

// Show Delete Confirmation Modal
function showDeleteConfirmation(borrowerId) {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.classList.remove('hidden');
    
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    confirmDeleteBtn.onclick = () => deleteBorrower(borrowerId);
}

// Hide Delete Modal
function hideDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
}

// Delete Borrower
function deleteBorrower(borrowerId) {
    const borrowers = JSON.parse(localStorage.getItem('borrowers')) || [];
    const borrower = borrowers.find(b => b.id === borrowerId);

    if (borrower && borrower.borrowedBooks > 0) {
        window.libraryUtils.showNotification('Cannot delete borrower with borrowed books', 'error');
        hideDeleteModal();
        return;
    }

    const updatedBorrowers = borrowers.filter(borrower => borrower.id !== borrowerId);
    localStorage.setItem('borrowers', JSON.stringify(updatedBorrowers));
    
    hideDeleteModal();
    loadBorrowers();
    window.libraryUtils.showNotification('Borrower deleted successfully!', 'success');
}

// Toggle Borrower Status
function toggleBorrowerStatus(borrowerId) {
    const borrowers = JSON.parse(localStorage.getItem('borrowers')) || [];
    const index = borrowers.findIndex(b => b.id === borrowerId);
    
    if (index !== -1) {
        borrowers[index].status = borrowers[index].status === 'active' ? 'inactive' : 'active';
        localStorage.setItem('borrowers', JSON.stringify(borrowers));
        loadBorrowers();
        
        const statusText = borrowers[index].status === 'active' ? 'activated' : 'deactivated';
        window.libraryUtils.showNotification(`Borrower ${statusText} successfully!`, 'success');
    }
}