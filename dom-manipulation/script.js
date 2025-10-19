// --------------------
// Initial quotes array
// --------------------
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "Believe in yourself.", category: "Motivation" },
  { text: "Stay positive.", category: "Inspiration" },
  { text: "Never give up.", category: "Motivation" },
  { text: "Be kind to others.", category: "Life" }
];

// --------------------
// References
// --------------------
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');

// --------------------
// Display a random quote
// --------------------
function showRandomQuote() {
  const selectedCategory = categoryFilter?.value || 'all';
  let filteredQuotes = quotes;

  if (selectedCategory !== 'all') {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = filteredQuotes[randomIndex].text;
}

// --------------------
// Create Add Quote Form (Missing Function)
// --------------------
function createAddQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.id = 'addQuoteForm';

  const quoteInput = document.createElement('input');
  quoteInput.type = 'text';
  quoteInput.id = 'newQuoteText';
  quoteInput.placeholder = 'Enter a new quote';

  const categoryInput = document.createElement('input');
  categoryInput.type = 'text';
  categoryInput.id = 'newQuoteCategory';
  categoryInput.placeholder = 'Enter quote category';

  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';
  addButton.addEventListener('click', addQuote);

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// --------------------
// Populate categories
// --------------------
function populateCategories() {
  let categorySelect = document.getElementById('categoryFilter');

  if (!categorySelect) {
    categorySelect = document.createElement('select');
    categorySelect.id = 'categoryFilter';
    document.body.insertBefore(categorySelect, quoteDisplay);
    categorySelect.addEventListener('change', filterQuotes);
  }

  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  const lastCategory = localStorage.getItem('lastCategory') || 'all';
  categorySelect.value = lastCategory;
}

// --------------------
// Filter quotes
// --------------------
function filterQuotes() {
  localStorage.setItem('lastCategory', categoryFilter.value);
  showRandomQuote();
}

// --------------------
// Notification helper
// --------------------
function notify(message) {
  const notif = document.createElement('div');
  notif.textContent = message;
  notif.style.position = 'fixed';
  notif.style.bottom = '10px';
  notif.style.right = '10px';
  notif.style.background = '#28a745';
  notif.style.color = 'white';
  notif.style.padding = '10px';
  notif.style.borderRadius = '5px';
  notif.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

// --------------------
// Add a new quote
// --------------------
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');

  const newQuote = {
    text: textInput.value.trim(),
    category: categoryInput.value.trim()
  };

  if (!newQuote.text || !newQuote.category) {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push(newQuote);
  localStorage.setItem('quotes', JSON.stringify(quotes));
  postQuoteToServer(newQuote);

  populateCategories();
  showRandomQuote();

  textInput.value = '';
  categoryInput.value = '';
}

// --------------------
// Simulate server sync
// --------------------
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=5';

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverQuotes = await response.json();
    return serverQuotes.map(q => ({ text: q.title, category: q.body }));
  } catch (err) {
    console.error('Failed to fetch server quotes:', err);
    return [];
  }
}

async function postQuoteToServer(quote) {
  try {
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify(quote),
      headers: { 'Content-Type': 'application/json' }
    });
    notify("Quote posted to server!");
  } catch (err) {
    console.error("Failed to post quote:", err);
  }
}

async function syncQuotesWithServer() {
  const serverQuotes = await fetchQuotesFromServer();
  let localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];

  serverQuotes.forEach(sq => {
    if (!sq.text || !sq.category) return;
    const index = localQuotes.findIndex(lq => lq.text === sq.text);
    if (index >= 0) {
      localQuotes[index].category = sq.category;
    } else {
      localQuotes.push(sq);
    }
  });

  localStorage.setItem('quotes', JSON.stringify(localQuotes));
  quotes = localQuotes;
  populateCategories();
  showRandomQuote();
  notify("Quotes synced with server!");
}

// --------------------
// Initialize
// --------------------
populateCategories();
createAddQuoteForm();
showRandomQuote();
newQuoteBtn.addEventListener('click', showRandomQuote);

// Optional: Sync with server every 60s
setInterval(syncQuotesWithServer, 60000);
