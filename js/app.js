// DOM Elements
const bookForm = document.getElementById('bookForm');
const bookList = document.getElementById('bookList');
const totalBooksEl = document.getElementById('totalBooks');
const availableBooksEl = document.getElementById('availableBooks');
const filterButtons = document.querySelectorAll('.btn-filter');

// Book class
class Book {
  constructor(title, author, genre, status = 'Available') {
    this.id = Date.now().toString();
    this.title = title;
    this.author = author;
    this.genre = genre;
    this.status = status;
    this.addedAt = new Date();
  }
}

// UI Class: Handle UI Tasks
class UI {
  static displayBooks(books) {
    // Clear current book list
    bookList.innerHTML = '';
    
    if (books.length === 0) {
      bookList.innerHTML = `
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM12 8v8M8 12h8"/>
          </svg>
          <p>No books found. Try adjusting your filters or add a new book.</p>
        </div>
      `;
      return;
    }
    
    // Create book items
    books.forEach(book => {
      UI.addBookToList(book);
    });
    
    // Update stats
    UI.updateStats(books);
  }
  
  static addBookToList(book) {
    const bookItem = document.createElement('div');
    bookItem.className = 'book-item';
    bookItem.dataset.id = book.id;
    bookItem.dataset.genre = book.genre.toLowerCase();
    bookItem.dataset.status = book.status.toLowerCase();
    
    const statusClass = book.status.toLowerCase() === 'available' ? 'available' : 
                       book.status.toLowerCase() === 'borrowed' ? 'borrowed' : 'reserved';
    
    bookItem.innerHTML = `
      <div class="book-info">
        <h3>${book.title}</h3>
        <div class="book-meta">
          <span>${book.author}</span>
          <span>${book.genre}</span>
          <span class="status ${statusClass}">
            <svg class="icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
              <path d="M22 4L12 14.01l-3-3"></path>
            </svg>
            ${book.status}
          </span>
        </div>
      </div>
      <div class="book-actions">
        <button class="btn-icon delete-book" aria-label="Delete book">
          <svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2m-6 5v6m4-6v6"></path>
          </svg>
        </button>
      </div>
    `;
    
    bookList.appendChild(bookItem);
  }
  
  static updateStats(books) {
    const totalBooks = books.length;
    const availableBooks = books.filter(book => book.status === 'Available').length;
    
    totalBooksEl.textContent = totalBooks;
    availableBooksEl.textContent = availableBooks;
  }
  
  static clearForm() {
    bookForm.reset();
  }
  
  static showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.appendChild(document.createTextNode(message));
    
    const container = document.querySelector('.container');
    const header = document.querySelector('header');
    container.insertBefore(alertDiv, header.nextSibling);
    
    // Remove alert after 3 seconds
    setTimeout(() => alertDiv.remove(), 3000);
  }
}

// Store Class: Handles Storage
class Store {
  static getBooks() {
    let books;
    if (localStorage.getItem('books') === null) {
      books = [];
    } else {
      books = JSON.parse(localStorage.getItem('books'));
    }
    return books;
  }
  
  static addBook(book) {
    const books = Store.getBooks();
    books.push(book);
    localStorage.setItem('books', JSON.stringify(books));
  }
  
  static removeBook(id) {
    const books = Store.getBooks();
    const updatedBooks = books.filter(book => book.id !== id);
    localStorage.setItem('books', JSON.stringify(updatedBooks));
  }
  
  static filterBooks(filter) {
    const books = Store.getBooks();
    
    if (filter === 'all') {
      return books;
    }
    
    // Check if filter is a status or genre
    const statuses = ['available', 'borrowed', 'reserved'];
    const isStatusFilter = statuses.includes(filter.toLowerCase());
    
    if (isStatusFilter) {
      return books.filter(book => book.status.toLowerCase() === filter.toLowerCase());
    } else {
      // Genre filter
      return books.filter(book => book.genre.toLowerCase() === filter.toLowerCase());
    }
  }
}

// Event: Display Books
document.addEventListener('DOMContentLoaded', () => {
  const books = Store.getBooks();
  UI.displayBooks(books);
});

// Event: Add a Book
bookForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Get form values
  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const genre = document.getElementById('genre').value;
  const status = document.getElementById('status').value;
  
  // Validate
  if (title === '' || author === '' || genre === '') {
    UI.showAlert('Please fill in all fields', 'error');
    return;
  }
  
  // Create new book
  const book = new Book(title, author, genre, status);
  
  // Add to UI
  UI.addBookToList(book);
  
  // Add to store
  Store.addBook(book);
  
  // Update stats
  const books = Store.getBooks();
  UI.updateStats(books);
  
  // Clear form
  UI.clearForm();
  
  // Show success message
  UI.showAlert('Book added successfully!');
  
  // Trigger filter to refresh the list
  const activeFilter = document.querySelector('.btn-filter.active');
  if (activeFilter) {
    const filter = activeFilter.dataset.filter;
    const filteredBooks = Store.filterBooks(filter);
    UI.displayBooks(filteredBooks);
  }
});

// Event: Remove a Book
bookList.addEventListener('click', (e) => {
  if (e.target.closest('.delete-book')) {
    const bookItem = e.target.closest('.book-item');
    const bookId = bookItem.dataset.id;
    
    // Remove from UI
    bookItem.remove();
    
    // Remove from store
    Store.removeBook(bookId);
    
    // Update stats
    const books = Store.getBooks();
    UI.updateStats(books);
    
    // Show success message
    UI.showAlert('Book removed successfully!');
    
    // If no books left, show empty state
    if (books.length === 0) {
      bookList.innerHTML = `
        <div class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM12 8v8M8 12h8"/>
          </svg>
          <p>No books found. Try adjusting your filters or add a new book.</p>
        </div>
      `;
    }
  }
});

// Event: Filter Books
filterButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    // Update active button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    // Get filter value
    const filter = e.target.dataset.filter;
    
    // Filter books
    const filteredBooks = Store.filterBooks(filter);
    
    // Display filtered books
    UI.displayBooks(filteredBooks);
  });
});

// Initialize the app
function init() {
  // Check if there are books in local storage
  const books = Store.getBooks();
  
  // If no books, show empty state
  if (books.length === 0) {
    bookList.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM12 8v8M8 12h8"/>
        </svg>
        <p>No books added yet. Add your first book to get started!</p>
      </div>
    `;
  } else {
    // Display all books
    UI.displayBooks(books);
  }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
