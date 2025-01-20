class DataManager {
    constructor() {
        this.storageKey = 'salesHistory';
    }

    saveDailySales(date, data) {
        const salesHistory = this.getSalesHistory();
        // Ne asigurăm că toate valorile sunt numere
        const cleanData = {};
        for (let key in data) {
            cleanData[key] = parseInt(data[key]) || 0;
        }
        salesHistory[date] = cleanData;
        localStorage.setItem(this.storageKey, JSON.stringify(salesHistory));
    }

    getSalesHistory() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
    }

    getDataForDay(dayNumber) {
        const salesHistory = this.getSalesHistory();
        return Object.entries(salesHistory)
            .filter(([date]) => new Date(date).getDay() === parseInt(dayNumber))
            .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA));
    }

    getLastThreeWeeksSales() {
        const salesHistory = this.getSalesHistory();
        const sortedDates = Object.keys(salesHistory)
            .sort((a, b) => new Date(b) - new Date(a))
            .slice(0, 21); // Ultimele 21 de zile
        
        return sortedDates.map(date => salesHistory[date]);
    }

    deleteSalesData(date) {
        const salesHistory = this.getSalesHistory();
        delete salesHistory[date];
        localStorage.setItem(this.storageKey, JSON.stringify(salesHistory));
    }

    resetAllData() {
        localStorage.removeItem(this.storageKey);
    }
} 