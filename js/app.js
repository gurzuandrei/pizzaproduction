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
        const selectedDay = document.getElementById('historyDayFilter').value;
        const historicalData = dataManager.getDataForDay(selectedDay);
        const historicalDisplay = document.getElementById('historicalDisplay');
        
        historicalDisplay.innerHTML = `
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Total Batches</th>
                        <th colspan="4">Pan Pizza</th>
                        <th colspan="3">Stuffed Crust</th>
                        <th colspan="4">San Francisco</th>
                        <th>Actions</th>
                    </tr>
                    <tr class="sub-header">
                        <th></th>
                        <th></th>
                        <th>S</th>
                        <th>M</th>
                        <th>L</th>
                        <th>XL</th>
                        <th>M</th>
                        <th>L</th>
                        <th>XL</th>
                        <th>S</th>
                        <th>M</th>
                        <th>L</th>
                        <th>XL</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    ${historicalData.map(([timestamp, data]) => {
                        const date = new Date(timestamp);
                        const formattedDate = date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                        return `
                        <tr>
                            <td>${formattedDate}</td>
                            <td>${data.totalBatches}</td>
                            <td>${data.predictions.pan.small}</td>
                            <td>${data.predictions.pan.medium}</td>
                            <td>${data.predictions.pan.large}</td>
                            <td>${data.predictions.pan.xlarge}</td>
                            <td>${data.predictions.stuffed.medium}</td>
                            <td>${data.predictions.stuffed.large}</td>
                            <td>${data.predictions.stuffed.xlarge}</td>
                            <td>${data.predictions.sanFrancisco.small}</td>
                            <td>${data.predictions.sanFrancisco.medium}</td>
                            <td>${data.predictions.sanFrancisco.large}</td>
                            <td>${data.predictions.sanFrancisco.xlarge}</td>
                            <td>
                                <button class="delete-button" onclick="deletePredictionData('${timestamp}')">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
        `;
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
            showNotification('Data saved successfully!', 'success');
        } catch (error) {
            showNotification('Error saving data!', 'error');
            console.error(error);
        }
    }

    function generatePredictions() {
        const historicalData = dataManager.getLastThreeWeeksSales();
        const calculator = new DoughCalculator(historicalData);
        
        try {
            const predictions = calculator.getPrediction();
            const totalBatches = calculator.getTotalDough();
            
            // Get the selected day and week
            const selectedDay = parseInt(daySelector.value);
            const selectedWeek = parseInt(weekSelector.value);
            
            // Calculate the target date based on selected day and week
            const today = new Date();
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() - (selectedWeek * 7));
            
            // Adjust to the selected day
            const currentDay = targetDate.getDay();
            const daysToAdd = (selectedDay - currentDay + 7) % 7;
            targetDate.setDate(targetDate.getDate() + daysToAdd);
            
            // Add one more day since predictions are for the next day
            targetDate.setDate(targetDate.getDate() + 1);
            
            // Save predictions with the correct date
            dataManager.savePrediction(predictions, totalBatches, targetDate);
            
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
            
            const formattedDate = targetDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            document.getElementById('predictionTimestamp').textContent = 
                `Prediction for: ${formattedDate}`;
            
            updateHistoricalDisplay();
            
            showNotification('Predictions generated successfully!', 'success');
        } catch (error) {
            console.error('Error generating predictions:', error);
            showNotification('Error generating predictions', 'error');
        }
    }

    function resetAllData() {
        if (confirm('Are you sure you want to delete all saved data? This action cannot be undone.')) {
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
                showNotification('All data has been deleted', 'success');
            } catch (error) {
                showNotification('Error deleting data', 'error');
                console.error(error);
            }
        }
    }

    function showNotification(message, type, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('hidden');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // Funcție pentru salvarea automată a datelor
    function autoSaveData() {
        const selectedDay = daySelector.value;
        const selectedWeek = parseInt(weekSelector.value);
        
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - (selectedWeek * 7));
        
        const currentDay = targetDate.getDay();
        const daysToAdd = (selectedDay - currentDay + 7) % 7;
        targetDate.setDate(targetDate.getDate() + daysToAdd);

        const dateString = targetDate.toISOString().split('T')[0];
        
        const formData = new FormData(salesForm);
        const salesData = {};
        
        formData.forEach((value, key) => {
            salesData[key] = parseInt(value) || 0;
        });
        
        try {
            dataManager.saveDailySales(dateString, salesData);
            updateHistoricalDisplay();
            showNotification('Data saved automatically', 'success', 1000);
        } catch (error) {
            console.error(error);
            showNotification('Error saving data', 'error');
        }
    }

    // Adăugăm event listener pentru toate input-urile de număr
    salesForm.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('change', autoSaveData);
        input.addEventListener('blur', autoSaveData);
    });

    // Adăugăm event listener pentru selectoare
    daySelector.addEventListener('change', () => {
        loadFormData();
        updateHistoricalDisplay();
    });

    weekSelector.addEventListener('change', () => {
        salesForm.reset();
        loadFormData();
        updateHistoricalDisplay();
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
                showNotification('Modifications saved successfully!', 'success');
                closeModal();
            } catch (error) {
                showNotification('Error saving modifications', 'error');
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
        updateHistoricalDisplay();
    });

    currentWeek = parseInt(weekSelector.value);
    updateHistoricalDisplay();
    loadFormData();

    function calculateTrend(historicalData) {
        if (!Array.isArray(historicalData) || historicalData.length < 14) return '-';

        const calculateTotal = (data) => {
            return data.reduce((total, day) => {
                if (!day || typeof day !== 'object') return total;
                return total + Object.values(day).reduce((sum, value) => 
                    sum + (parseInt(value) || 0), 0);
            }, 0);
        };

        const lastWeekTotal = calculateTotal(historicalData.slice(0, 7));
        const prevWeekTotal = calculateTotal(historicalData.slice(7, 14));

        if (prevWeekTotal === 0) return '-';

        const change = ((lastWeekTotal - prevWeekTotal) / prevWeekTotal) * 100;
        
        if (change > 0) return `+${change.toFixed(1)}%`;
        if (change < 0) return `${change.toFixed(1)}%`;
        return '0%';
    }

    // Funcție pentru ștergerea unei predicții din istoric
    window.deletePredictionData = function(timestamp) {
        if (confirm('Are you sure you want to delete this prediction from history?')) {
            dataManager.deletePredictionData(timestamp);
            updateHistoricalDisplay();
            showNotification('Prediction deleted successfully', 'success');
        }
    };
}); 