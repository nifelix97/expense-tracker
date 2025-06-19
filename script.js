const form = document.getElementById('expense-form');
const list = document.getElementById('expenses-list');
const balanceDisplay = document.getElementById('balance');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

function updateLocalStorage() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

function calculateBalance() {
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  balanceDisplay.textContent = total.toFixed(2);
}

function renderExpenses(expensesToRender = expenses) {
  list.innerHTML = '';
  expensesToRender.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = `expense-item ${item.amount < 0 ? 'expense' : 'income'}`;
    li.innerHTML = `
      <span>${item.date} - ${item.description} - ${item.amount} RWF</span>
      <div>
        <button onclick="editExpense(${index})">Edit</button>
        <button onclick="deleteExpense(${index})">Delete</button>
      </div>
    `;
    list.appendChild(li);
  });
  calculateBalance();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const description = document.getElementById('description').value;
  const type = document.getElementById('type').value;
  const amountInput = Number(document.getElementById('amount').value);
  const amount = type === 'expense' ? -Math.abs(amountInput) : Math.abs(amountInput);
  const date = document.getElementById('date').value;

  if (!description || !amount || !date) return;

  expenses.push({ description, amount, date });
  updateLocalStorage();
  renderExpenses();
  form.reset();
});


function deleteExpense(index) {
  expenses.splice(index, 1);
  updateLocalStorage();
  renderExpenses();
}

function editExpense(index) {
  const item = expenses[index];
  document.getElementById('description').value = item.description;
  document.getElementById('amount').value = item.amount;
  document.getElementById('date').value = item.date;
  deleteExpense(index);
}

renderExpenses();
calculateBalance();
document.getElementById('clear-expenses').addEventListener('click', () => {
  expenses = [];
  updateLocalStorage();
  renderExpenses();
});
document.getElementById('export-expenses').addEventListener('click', () => {
  const csvContent = "data:text/csv;charset=utf-8," + 
    expenses.map(e => `${e.date},${e.description},${e.amount}`).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "expenses.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
document.getElementById('import-expenses').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const csvData = event.target.result.split('\n').map(row => row.split(','));
    csvData.forEach(row => {
      if (row.length === 3) {
        expenses.push({ date: row[0], description: row[1], amount: Number(row[2]) });
      }
    });
    updateLocalStorage();
    renderExpenses();
  };
  reader.readAsText(file);
});
document.getElementById('toggle-theme').addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  const theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
});

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.classList.toggle('dark-theme', savedTheme === 'dark');
});


document.getElementById('search-expenses').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filteredExpenses = expenses.filter(e => e.description.toLowerCase().includes(query));
  renderExpenses(filteredExpenses);
});