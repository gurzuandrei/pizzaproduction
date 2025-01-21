class DoughCalculator {
    static BATCH_SIZE = 90; // One batch = 90 small pizzas
    static BUFFER_FACTOR = 1.1; // Safety factor of 10%
    
    static SMALL_EQUIVALENT = {
        'small': 1,    // 1 small = 1 small
        'medium': 2,   // 1 medium = 2 small
        'large': 3,    // 1 large = 3 small
        'xlarge': 4    // 1 xlarge = 4 small
    };

    static WEIGHTS = [0.5, 0.3, 0.2]; // Weights for the last 3 weeks

    constructor(salesHistory) {
        this.salesHistory = this.#validateSalesHistory(salesHistory);
    }

    // Private method for validating sales history
    #validateSalesHistory(history) {
        if (!Array.isArray(history)) {
            console.warn('Invalid sales history, using empty array');
            return [];
        }
        return history.filter(day => {
            if (!day || typeof day !== 'object') return false;
            // Check if all values are positive numbers
            return Object.values(day).every(value => {
                const num = parseInt(value);
                return !isNaN(num) && num >= 0;
            });
        });
    }

    // Private method for calculating weighted average
    #calculateWeightedAverage(values) {
        if (!Array.isArray(values) || values.length === 0) return 0;

        const validValues = values.map(v => Math.max(0, parseInt(v) || 0));
        let weightedSum = 0;
        let weightSum = 0;

        validValues.forEach((value, index) => {
            if (index < DoughCalculator.WEIGHTS.length) {
                weightedSum += value * DoughCalculator.WEIGHTS[index];
                weightSum += DoughCalculator.WEIGHTS[index];
            }
        });

        return weightSum > 0 ? 
            Math.ceil((weightedSum / weightSum) * DoughCalculator.BUFFER_FACTOR) : 0;
    }

    // Private method for extracting values for a specific pizza type
    #getValuesForType(pizzaType) {
        if (!pizzaType || typeof pizzaType !== 'string') return [];
        return this.salesHistory
            .map(day => Math.max(0, parseInt(day[pizzaType]) || 0));
    }

    getPrediction() {
        return {
            pan: {
                small: this.#calculateWeightedAverage(this.#getValuesForType('pan-small')),
                medium: this.#calculateWeightedAverage(this.#getValuesForType('pan-medium')),
                large: this.#calculateWeightedAverage(this.#getValuesForType('pan-large')),
                xlarge: this.#calculateWeightedAverage(this.#getValuesForType('pan-xlarge'))
            },
            stuffed: {
                medium: this.#calculateWeightedAverage(this.#getValuesForType('stuffed-medium')),
                large: this.#calculateWeightedAverage(this.#getValuesForType('stuffed-large')),
                xlarge: this.#calculateWeightedAverage(this.#getValuesForType('stuffed-xlarge'))
            },
            sanFrancisco: {
                small: this.#calculateWeightedAverage(this.#getValuesForType('sf-small')),
                medium: this.#calculateWeightedAverage(this.#getValuesForType('sf-medium')),
                large: this.#calculateWeightedAverage(this.#getValuesForType('sf-large')),
                xlarge: this.#calculateWeightedAverage(this.#getValuesForType('sf-xlarge'))
            }
        };
    }

    getTotalDough() {
        const predictions = this.getPrediction();
        const totalSmallEquivalent = Object.entries(predictions)
            .reduce((total, [_, type]) => {
                return total + Object.entries(type)
                    .reduce((typeTotal, [size, count]) => {
                        const smallEquivalent = DoughCalculator.SMALL_EQUIVALENT[size] || 0;
                        return typeTotal + (count * smallEquivalent);
                    }, 0);
            }, 0);

        // Calculate the number of batches and round to one decimal
        return Number((totalSmallEquivalent / DoughCalculator.BATCH_SIZE).toFixed(1));
    }
} 