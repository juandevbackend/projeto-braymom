'use strict';

// Elementos principais da tela
const fileInput = document.querySelector('#fileInput');
const dropzone = document.querySelector('#dropzone');
const browseButton = document.querySelector('#browseButton');
const selectedFilePanel = document.querySelector('#selectedFile');
const selectedFileName = document.querySelector('#selectedFileName');
const selectedFileMeta = document.querySelector('#selectedFileMeta');
const selectedFileIcon = document.querySelector('#selectedFileIcon');
const removeFileButton = document.querySelector('#removeFile');
const uploadFeedback = document.querySelector('#uploadFeedback');
const continueButton = document.querySelector('#continueButton');
const continueHint = document.querySelector('#continueHint');
const previewBadge = document.querySelector('#previewBadge');
const previewNotice = document.querySelector('#previewNotice');
const previewDescription = document.querySelector('#previewDescription');
const previewBody = document.querySelector('#previewBody');
const tableCount = document.querySelector('#tableCount');
const revenueTotal = document.querySelector('#revenueTotal');
const expenseTotal = document.querySelector('#expenseTotal');
const recordCount = document.querySelector('#recordCount');
const toast = document.querySelector('#toast');
const mobileMenu = document.querySelector('#mobileMenu');
const sidebar = document.querySelector('#sidebar');

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['xlsx', 'csv'];
let selectedFile = null;
let toastTimeout;

// Valores fictícios para demonstrar o layout. Não representam dados lidos do arquivo.
const demoRows = [
  { date: '05/10/2026', description: 'Salário', category: 'Receita', value: 3000, type: 'income' },
  { date: '06/10/2026', description: 'Aluguel', category: 'Moradia', value: -850, type: 'expense' },
  { date: '08/10/2026', description: 'Internet', category: 'Serviços', value: -99.9, type: 'expense' },
  { date: '10/10/2026', description: 'Freelance', category: 'Receita', value: 450, type: 'income' }
];

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove('visible'), 3600);
}

function setFeedback(message, type = '') {
  uploadFeedback.textContent = message;
  uploadFeedback.className = `upload-feedback${type ? ` ${type}` : ''}`;
}

function renderDemoPreview() {
  previewBody.replaceChildren();

  demoRows.forEach((row) => {
    const tr = document.createElement('tr');

    const dateCell = document.createElement('td');
    dateCell.textContent = row.date;

    const descriptionCell = document.createElement('td');
    const transactionName = document.createElement('span');
    transactionName.className = 'transaction-name';
    const dot = document.createElement('span');
    dot.className = `transaction-dot ${row.type}`;
    const description = document.createElement('span');
    description.textContent = row.description;
    transactionName.append(dot, description);
    descriptionCell.append(transactionName);

    const categoryCell = document.createElement('td');
    categoryCell.textContent = row.category;

    const valueCell = document.createElement('td');
    valueCell.className = `amount ${row.value >= 0 ? 'positive' : 'negative'}`;
    valueCell.textContent = `${row.value >= 0 ? '+' : '−'} ${formatCurrency(Math.abs(row.value))}`;

    const statusCell = document.createElement('td');
    const status = document.createElement('span');
    status.className = 'status-chip valid';
    const statusDot = document.createElement('span');
    const statusText = document.createElement('span');
    statusText.textContent = 'Exemplo';
    status.append(statusDot, statusText);
    statusCell.append(status);

    tr.append(dateCell, descriptionCell, categoryCell, valueCell, statusCell);
    previewBody.append(tr);
  });

  const income = demoRows.filter(row => row.value > 0).reduce((sum, row) => sum + row.value, 0);
  const expenses = Math.abs(demoRows.filter(row => row.value < 0).reduce((sum, row) => sum + row.value, 0));
  revenueTotal.textContent = formatCurrency(income);
  expenseTotal.textContent = formatCurrency(expenses);
  recordCount.textContent = String(demoRows.length);
  tableCount.textContent = `Exibindo ${demoRows.length} linhas fictícias`;
}

function resetPreviewToDemo() {
  renderDemoPreview();
  previewBadge.textContent = 'DEMONSTRAÇÃO';
  previewNotice.hidden = false;
  previewNotice.replaceChildren();
  const icon = document.createElement('span');
  icon.textContent = 'ⓘ';
  const message = document.createElement('span');
  message.textContent = 'Estes dados são fictícios. A leitura real será habilitada quando conectarmos o backend Python.';
  previewNotice.append(icon, message);
  previewDescription.textContent = 'Um exemplo de como os registros serão apresentados.';
}

function validateFile(file) {
  if (!file) return 'Nenhum arquivo foi selecionado.';

  const extension = file.name.includes('.')
    ? file.name.split('.').pop().toLowerCase()
    : '';

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return 'Formato não suportado. Selecione um arquivo .xlsx ou .csv.';
  }

  if (file.size === 0) {
    return 'O arquivo está vazio. Selecione outro arquivo.';
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'O arquivo ultrapassa o limite de 10 MB.';
  }

  return '';
}

function handleFile(file) {
  const validationMessage = validateFile(file);

  if (validationMessage) {
    setFeedback(validationMessage, 'error');
    showToast(validationMessage);
    return;
  }

  selectedFile = file;
  const extension = file.name.split('.').pop().toLowerCase();

  selectedFileName.textContent = file.name;
  selectedFileMeta.textContent = `${formatFileSize(file.size)} · Formato ${extension.toUpperCase()} · Selecionado`;
  selectedFileIcon.textContent = extension === 'xlsx' ? 'XLSX' : 'CSV';
  selectedFilePanel.hidden = false;
  dropzone.hidden = true;

  continueButton.disabled = false;
  continueHint.textContent = 'Arquivo selecionado. A próxima etapa será conectada à API.';
  setFeedback('Arquivo selecionado. As verificações atuais são locais; o conteúdo ainda não foi lido.', 'success');

  // Não mostramos os dados do arquivo até implementar a leitura segura no backend.
  previewBody.replaceChildren();
  const tr = document.createElement('tr');
  const td = document.createElement('td');
  td.colSpan = 5;
  td.textContent = 'Arquivo selecionado. A prévia real será exibida após a integração com o backend Python.';
  td.style.whiteSpace = 'normal';
  td.style.lineHeight = '1.6';
  td.style.padding = '22px';
  tr.append(td);
  previewBody.append(tr);

  previewBadge.textContent = 'AGUARDANDO API';
  previewNotice.hidden = false;
  previewNotice.replaceChildren();
  const icon = document.createElement('span');
  icon.textContent = 'ⓘ';
  const message = document.createElement('span');
  message.textContent = 'O arquivo foi selecionado, mas ainda não foi enviado nem processado. Nenhum dado foi importado.';
  previewNotice.append(icon, message);
  previewDescription.textContent = 'A leitura das linhas será implementada na próxima etapa.';
  tableCount.textContent = 'Prévia indisponível até conectar a API';
  revenueTotal.textContent = '—';
  expenseTotal.textContent = '—';
  recordCount.textContent = '—';
}

function clearSelectedFile() {
  selectedFile = null;
  fileInput.value = '';
  selectedFilePanel.hidden = true;
  dropzone.hidden = false;
  continueButton.disabled = true;
  continueHint.textContent = 'Selecione um arquivo para habilitar a próxima etapa.';
  setFeedback('');
  resetPreviewToDemo();
}

browseButton.addEventListener('click', (event) => {
  event.stopPropagation();
  fileInput.click();
});

dropzone.addEventListener('click', (event) => {
  if (event.target.closest('button')) return;
  fileInput.click();
});

dropzone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (file) handleFile(file);
});

removeFileButton.addEventListener('click', clearSelectedFile);

dropzone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', (event) => {
  if (!dropzone.contains(event.relatedTarget)) dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropzone.classList.remove('dragover');
  const file = event.dataTransfer?.files?.[0];
  if (file) handleFile(file);
});

continueButton.addEventListener('click', () => {
  if (!selectedFile) return;
  showToast('Próxima etapa planejada: mapear as colunas com a API Python. Essa integração ainda não foi implementada.');
});

mobileMenu.addEventListener('click', () => {
  const isOpen = sidebar.classList.toggle('open');
  mobileMenu.setAttribute('aria-expanded', String(isOpen));
  mobileMenu.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
});

document.addEventListener('click', (event) => {
  if (window.innerWidth <= 900 &&
      sidebar.classList.contains('open') &&
      !sidebar.contains(event.target) &&
      !mobileMenu.contains(event.target)) {
    sidebar.classList.remove('open');
    mobileMenu.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-label', 'Abrir menu');
  }
});

// Inicializa os números fictícios usados apenas no estado de demonstração.
renderDemoPreview();
