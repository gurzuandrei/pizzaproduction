document.addEventListener('DOMContentLoaded', () => {
    const dataManager = new DataManager();
    const daySelector = document.getElementById('daySelector');
    const weekSelector = document.getElementById('weekSelector');
    const salesForm = document.getElementById('salesForm');
    const generateButton = document.getElementById('generateButton');
    const resetButton = document.getElementById('resetButton');
    let currentWeek = null;

    function saveInputValue(input) {
        const selectedDay = daySelector.value;
        const selectedWeek = weekSelector.value;
        const inputName = input.name;
        const inputValue = input.value;
        
        const tempKey = `temp_${selectedWeek}`;
        let weekData = JSON.parse(localStorage.getItem(tempKey) || '{}');
        
        if (!weekData[selectedDay]) {
            weekData[selectedDay] = {};
        }
        
        weekData[selectedDay][inputName] = inputValue || '0';
        localStorage.setItem(tempKey, JSON.stringify(weekData));
    }

    function loadTemporaryData() {
        const selectedDay = daySelector.value;
        const selectedWeek = weekSelector.value;
        const tempKey = `temp_${selectedWeek}`;
        
        const savedData = localStorage.getItem(tempKey);
        if (savedData) {
            const weekData = JSON.parse(savedData);
            const dayData = weekData[selectedDay] || {};
            
            Object.entries(dayData).forEach(([key, value]) => {
                const input = salesForm.elements[key];
                if (input) {
                    input.value = value;
                }
            });
        }
    }

    function clearTemporaryData(week) {
        const tempKey = `temp_${week}`;
        localStorage.removeItem(tempKey);
    }

    function updateHistoricalDisplay() {
        const selectedDay = daySelector.value;
        const historicalData = dataManager.getDataForDay(selectedDay);
        const historicalDisplay = document.getElementById('historicalDisplay');
        
        historicalDisplay.innerHTML = historicalData
            .map(([date, data]) => `
                <div class="historical-row" data-date="${date}">
                   <div class="historical-data">
                       <span class="date-label">${new Date(date).toLocaleDateString('ro-RO')}</span>
                       ${Object.entries(data)
                           .map(([key, value]) => `<span>${key.split('-').join(' ')}: ${value}</span>`)
                           .join('')}
                   </div>
                   <div class="row-actions">
                       <button class="edit-button" onclick="editHistoricalData('${date}')">
                           <i class="fas fa-edit"></i> Editează
                       </button>
                       <button class="delete-button" onclick="deleteHistoricalData('${date}')">
                           <i class="fas fa-trash-alt"></i> Șterge
                       </button>
                   </div>
                </div>
            `)
            .join('');
    }

    function loadFormData() {
        const selectedDay = daySelector.value;
        const selectedWeek = parseInt(weekSelector.value);
        
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - (selectedWeek * 7));
        
        const currentDay = targetDate.getDay();
        const daysToAdd = (selectedDay - currentDay + 7) % 7;
        targetDate.setDate(targetDate.getDate() + daysToAdd);

        const dateString = targetDate.toISOString().split('T')[0];
        const salesHistory = dataManager.getSalesHistory();
        
        if (salesHistory[dateString]) {
            const formInputs = salesForm.elements;
            Object.entries(salesHistory[dateString]).forEach(([key, value]) => {
                if (formInputs[key]) {
                    formInputs[key].value = value;
                }
            });
        } else {
            loadTemporaryData();
        }
    }

    function saveSalesData(e) {
        e.preventDefault();
        
        const selectedDay = daySelector.value;
        const selectedWeek = parseInt(weekSelector.value);
        
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - (selectedWeek * 7));
        
        const currentDay = targetDate.getDay();
        const daysToAdd = (selectedDay - currentDay + 7) % 7;
        targetDate.setDate(targetDate.getDate() + daysToAdd);

        const dateString = targetDate.toISOString().split('T')[0];
        
        const formData = new FormData(e.target);
        const salesData = {};
        
        formData.forEach((value, key) => {
            salesData[key] = parseInt(value) || 0;
        });
        
        try {
            dataManager.saveDailySales(dateString, salesData);
            const tempKey = `temp_${selectedWeek}`;
            const weekData = JSON.parse(localStorage.getItem(tempKey) || '{}');
            delete weekData[selectedDay];
            if (Object.keys(weekData).length > 0) {
                localStorage.setItem(tempKey, JSON.stringify(weekData));
            } else {
                localStorage.removeItem(tempKey);
            }
            
            updateHistoricalDisplay();
            showNotification('Date salvate cu succes!', 'success');
        } catch (error) {
            showNotification('Eroare la salvarea datelor!', 'error');
            console.error(error);
        }
    }

    function generatePredictions() {
        const selectedDay = daySelector.value;
        const historicalData = dataManager.getLastThreeWeeksSales();
        const calculator = new DoughCalculator(historicalData);
        
        try {
            const predictions = calculator.getPrediction();
            const totalBatches = calculator.getTotalDough();
            
            document.querySelector('.total-dough').textContent = totalBatches;
            document.querySelector('.trend-indicator').textContent = calculateTrend(historicalData);
            
            const predictionsDiv = document.getElementById('detailedPredictions');
            predictionsDiv.innerHTML = `
                <div class="predictions-content">
                    <div class="prediction-type">
                        <h3>Pan Pizza</h3>
                        <div class="prediction-value">
                            <span class="prediction-label">Small</span>
                            <span class="prediction-number">${predictions.pan.small}</span>
                        </div>
                        <div class="prediction-value">
                            <span class="prediction-label">Medium</span>
                            <span class="prediction-number">${predictions.pan.medium}</span>
                        </div>
                        <div class="prediction-value">
                            <span class="prediction-label">Large</span>
                            <span class="prediction-number">${predictions.pan.large}</span>
                        </div>
                        <div class="prediction-value">
                            <span class="prediction-label">XLarge</span>
                            <span class="prediction-number">${predictions.pan.xlarge}</span>
                        </div>
                    </div>
                    
                    <div class="prediction-type">
                        <h3>Stuffed Crust</h3>
                        <div class="prediction-value">
                            <span class="prediction-label">Medium</span>
                            <span class="prediction-number">${predictions.stuffed.medium}</span>
                        </div>
                        <div class="prediction-value">
                            <span class="prediction-label">Large</span>
                            <span class="prediction-number">${predictions.stuffed.large}</span>
                        </div>
                        <div class="prediction-value">
                            <span class="prediction-label">XLarge</span>
                            <span class="prediction-number">${predictions.stuffed.xlarge}</span>
                        </div>
                    </div>
                    
                    <div class="prediction-type">
                        <h3>San Francisco</h3>
                        <div class="prediction-value">
                            <span class="prediction-label">Small</span>
                            <span class="prediction-number">${predictions.sanFrancisco.small}</span>
                        </div>
                        <div class="prediction-value">
                            <span class="prediction-label">Medium</span>
                            <span class="prediction-number">${predictions.sanFrancisco.medium}</span>
                        </div>
                        <div class="prediction-value">
                            <span class="prediction-label">Large</span>
                            <span class="prediction-number">${predictions.sanFrancisco.large}</span>
                        </div>
                        <div class="prediction-value">
                            <span class="prediction-label">XLarge</span>
                            <span class="prediction-number">${predictions.sanFrancisco.xlarge}</span>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('predictionTimestamp').textContent = 
                `Ultima predicție: ${new Date().toLocaleString('ro-RO')}`;
            
            showNotification('Predicții generate cu succes!', 'success');
        } catch (error) {
            console.error('Eroare la generarea predicțiilor:', error);
            showNotification('Eroare la generarea predicțiilor', 'error');
        }
    }

    function resetAllData() {
        if (confirm('Ești sigur că vrei să ștergi toate datele salvate? Această acțiune nu poate fi anulată.')) {
            try {
                dataManager.resetAllData();
                for (let week = 1; week <= 4; week++) {
                    clearTemporaryData(week);
                }
                salesForm.reset();
                updateHistoricalDisplay();
                document.getElementById('detailedPredictions').innerHTML = '';
                document.getElementById('predictionTimestamp').textContent = '';
                document.querySelector('.total-dough').textContent = '0';
                document.querySelector('.trend-indicator').textContent = '-';
                showNotification('Toate datele au fost șterse', 'success');
            } catch (error) {
                showNotification('Eroare la ștergerea datelor', 'error');
                console.error(error);
            }
        }
    }

    function showNotification(message, type) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }

    daySelector.addEventListener('change', () => {
        updateHistoricalDisplay();
        loadFormData();
    });

    weekSelector.addEventListener('change', () => {
        salesForm.reset();
        loadFormData();
        currentWeek = parseInt(weekSelector.value);
    });

    salesForm.addEventListener('submit', saveSalesData);
    generateButton.addEventListener('click', generatePredictions);
    resetButton.addEventListener('click', resetAllData);

    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            tab.classList.add('active');
            const contentId = tab.getAttribute('data-tab');
            document.getElementById(contentId).classList.add('active');
        });
    });

    const inputs = salesForm.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            saveInputValue(e.target);
        });
        
        input.addEventListener('change', (e) => {
            if (e.target.value < 0) {
                e.target.value = 0;
                saveInputValue(e.target);
            }
        });
    });

    window.editHistoricalData = function(date) {
        const data = dataManager.getSalesHistory()[date];
        const editModal = document.getElementById('editModal');
        const editForm = document.getElementById('editForm');
        const editDate = editModal.querySelector('.edit-date');
        const closeModalBtn = editModal.querySelector('.close-modal');
        const cancelEditBtn = editModal.querySelector('.cancel-edit');
        
        editDate.textContent = new Date(date).toLocaleDateString('ro-RO');
        editForm.dataset.date = date;
        
        Object.entries(data).forEach(([key, value]) => {
            const input = editForm.elements[key];
            if (input) {
                input.value = value;
            }
        });
        
        editModal.classList.remove('hidden');
        
        const closeModal = () => {
            editModal.classList.add('hidden');
            editForm.reset();
        };
        
        closeModalBtn.onclick = closeModal;
        cancelEditBtn.onclick = closeModal;
        
        editModal.onclick = (e) => {
            if (e.target === editModal) {
                closeModal();
            }
        };
        
        editForm.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(editForm);
            const salesData = {};
            
            formData.forEach((value, key) => {
                salesData[key] = parseInt(value) || 0;
            });
            
            try {
                dataManager.saveDailySales(date, salesData);
                updateHistoricalDisplay();
                showNotification('Modificările au fost salvate cu succes!', 'success');
                closeModal();
            } catch (error) {
                showNotification('Eroare la salvarea modificărilor', 'error');
                console.error(error);
            }
        };
    };
    
    window.deleteHistoricalData = function(date) {
        if (confirm('Ești sigur că vrei să ștergi această înregistrare?')) {
            try {
                dataManager.deleteSalesData(date);
                updateHistoricalDisplay();
                showNotification('Înregistrare ștearsă cu succes!', 'success');
            } catch (error) {
                showNotification('Eroare la ștergerea înregistrării', 'error');
                console.error(error);
            }
        }
    };
    
    const historyDayFilter = document.getElementById('historyDayFilter');
    historyDayFilter.addEventListener('change', () => {
        const selectedFilter = historyDayFilter.value;
        if (selectedFilter === 'all') {
            daySelector.value = '1';
        } else {
            daySelector.value = selectedFilter;
        }
        updateHistoricalDisplay();
    });

    currentWeek = parseInt(weekSelector.value);
    updateHistoricalDisplay();
    loadFormData();

    function calculateTrend(historicalData) {
        if (historicalData.length < 14) return '-'; // Avem nevoie de cel puțin 2 săptămâni

        const lastWeek = historicalData.slice(0, 7);
        const prevWeek = historicalData.slice(7, 14);
        
        let lastWeekTotal = 0;
        let prevWeekTotal = 0;

        // Calculăm totalurile pentru fiecare săptămână
        [lastWeek, prevWeek].forEach((week, weekIndex) => {
            week.forEach(day => {
                Object.entries(day).forEach(([_, value]) => {
                    const count = parseInt(value) || 0;
                    if (weekIndex === 0) {
                        lastWeekTotal += count;
                    } else {
                        prevWeekTotal += count;
                    }
                });
            });
        });

        if (prevWeekTotal === 0) return '-';

        const change = ((lastWeekTotal - prevWeekTotal) / prevWeekTotal) * 100;
        
        // Returnăm doar procentul cu semn
        if (change > 0) {
            return `+${change.toFixed(1)}%`;
        } else if (change < 0) {
            return `${change.toFixed(1)}%`;
        }
        return `0%`;
    }
}); 