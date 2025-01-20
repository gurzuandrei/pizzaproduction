class DoughCalculator {
    constructor(salesHistory) {
        this.salesHistory = salesHistory;
        this.BATCH_SIZE = 90; // Un batch = 90 pizza mici

        // Coeficienții de conversie în echivalent small
        this.SMALL_EQUIVALENT = {
            'small': 1,    // 1 small = 1 small
            'medium': 2,   // 1 medium = 2 small
            'large': 3,    // 1 large = 3 small
            'xlarge': 4    // 1 xlarge = 4 small
        };
    }

    getPrediction() {
        return {
            pan: {
                small: this.calculatePrediction('pan-small'),
                medium: this.calculatePrediction('pan-medium'),
                large: this.calculatePrediction('pan-large'),
                xlarge: this.calculatePrediction('pan-xlarge')
            },
            stuffed: {
                medium: this.calculatePrediction('stuffed-medium'),
                large: this.calculatePrediction('stuffed-large'),
                xlarge: this.calculatePrediction('stuffed-xlarge')
            },
            sanFrancisco: {
                small: this.calculatePrediction('sf-small'),
                medium: this.calculatePrediction('sf-medium'),
                large: this.calculatePrediction('sf-large'),
                xlarge: this.calculatePrediction('sf-xlarge')
            }
        };
    }

    calculatePrediction(pizzaType) {
        // Ne asigurăm că avem numere valide
        const values = this.salesHistory
            .filter(day => day && typeof day === 'object')
            .map(day => parseInt(day[pizzaType]) || 0);

        if (values.length === 0) return 0;

        const weights = [0.5, 0.3, 0.2];
        let weightedSum = 0;
        let weightSum = 0;

        values.forEach((value, index) => {
            if (index < weights.length) {
                weightedSum += value * weights[index];
                weightSum += weights[index];
            }
        });

        return Math.ceil((weightedSum / weightSum) * 1.1);
    }

    getTotalDough() {
        const predictions = this.getPrediction();
        let totalSmallEquivalent = 0;

        // Calculăm totalul de pizza în echivalent small
        for (const type in predictions) {
            for (const size in predictions[type]) {
                const count = parseInt(predictions[type][size]) || 0;
                const smallEquivalent = this.SMALL_EQUIVALENT[size];
                totalSmallEquivalent += count * smallEquivalent;
            }
        }

        // Calculăm numărul de batch-uri (1 batch = 90 small)
        const batches = totalSmallEquivalent / this.BATCH_SIZE;
        
        // Returnăm cu o zecimală
        return Number(batches.toFixed(1));
    }
} 