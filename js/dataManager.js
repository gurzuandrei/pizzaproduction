class DataManager {
    constructor() {
        this.salesKey = 'salesData';
        this.predictionsKey = 'predictionsHistory';
        this.tempStoragePrefix = 'temp_';
    }

    // Metodă privată pentru parsarea datelor din localStorage
    #getStorageData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return {};
        }
    }

    // Metodă privată pentru salvarea datelor în localStorage
    #setStorageData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            throw new Error('Failed to save data');
        }
    }

    // Metodă privată pentru curățarea datelor de intrare
    #cleanInputData(data) {
        const cleanData = {};
        Object.entries(data).forEach(([key, value]) => {
            cleanData[key] = parseInt(value) || 0;
        });
        return cleanData;
    }

    saveDailySales(date, salesData) {
        if (!date || !salesData) {
            throw new Error('Invalid input data');
        }

        const cleanedData = this.#cleanInputData(salesData);
        const allSales = this.#getStorageData(this.salesKey);
        allSales[date] = cleanedData;
        this.#setStorageData(this.salesKey, allSales);
    }

    savePrediction(predictions, totalBatches, date) {
        if (!predictions || !totalBatches || !date) {
            throw new Error('Invalid prediction data');
        }

        const timestamp = date.toISOString();
        const predictionsHistory = this.#getStorageData(this.predictionsKey);
        
        predictionsHistory[timestamp] = {
            date: date.toLocaleDateString('en-US'),
            predictions,
            totalBatches
        };
        
        this.#setStorageData(this.predictionsKey, predictionsHistory);
    }

    getPredictionsHistory() {
        const predictionsHistory = this.#getStorageData(this.predictionsKey);
        return Object.entries(predictionsHistory)
            .sort((a, b) => new Date(b[0]) - new Date(a[0]));
    }

    getSalesHistory() {
        return this.#getStorageData(this.salesKey);
    }

    getDataForDay(selectedDay) {
        const predictionsHistory = this.getPredictionsHistory();
        
        if (!selectedDay || selectedDay === 'all') {
            return predictionsHistory;
        }
        
        selectedDay = parseInt(selectedDay);
        return predictionsHistory.filter(([timestamp]) => {
            const date = new Date(timestamp);
            let day = date.getDay();
            // Convert Sunday from 0 to 7 to match our system
            day = day === 0 ? 7 : day;
            return day === selectedDay;
        });
    }

    getLastThreeWeeksSales() {
        const salesHistory = this.getSalesHistory();
        return Object.values(salesHistory).slice(-21);
    }

    getTempData(week) {
        return this.#getStorageData(`${this.tempStoragePrefix}${week}`);
    }

    saveTempData(week, data) {
        this.#setStorageData(`${this.tempStoragePrefix}${week}`, data);
    }

    clearTempData(week) {
        localStorage.removeItem(`${this.tempStoragePrefix}${week}`);
    }

    deletePredictionData(timestamp) {
        if (!timestamp) {
            throw new Error('Invalid timestamp');
        }

        const predictionsHistory = this.#getStorageData(this.predictionsKey);
        delete predictionsHistory[timestamp];
        this.#setStorageData(this.predictionsKey, predictionsHistory);
    }

    deleteSalesData(date) {
        const salesHistory = this.getSalesHistory();
        delete salesHistory[date];
        return this.#setStorageData(this.salesKey, salesHistory);
    }

    resetAllData() {
        localStorage.removeItem(this.salesKey);
        localStorage.removeItem(this.predictionsKey);
        
        // Clear temporary data for the last 4 weeks
        for (let week = 1; week <= 4; week++) {
            this.clearTempData(week);
        }
    }
} 