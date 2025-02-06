export class Weight {
    private items: any[] = [];
    private weights: number[] = [];
    private totalWeight: number = 0;

    add(item: any, weight: number) {
        const id = this.items.indexOf(item);
        if (id === -1) {
            weight = Math.max(weight, 0);
            this.items.push(item);
            this.weights.push(weight);
        } else {
            weight = Math.max(-this.weights[id], weight);
            this.weights[id] += weight;
        }
        this.totalWeight += weight;
    }

    set(item: any, weight: number) {
        const id = this.items.indexOf(item);
        if (id === -1) {
            this.add(item, weight);
        } else {
            weight = Math.max(-this.weights[id], weight);
            this.totalWeight += weight;
            this.weights[id] = weight;
        }
    }

    get(): any {
        let rd = Math.random() * this.totalWeight;
        for (let i = 0, len = this.items.length; i < len; ++i) {
            if (rd < this.weights[i]) {
                return this.items[i];
            }
            rd -= this.weights[i];
        }
        return null;
    }
}