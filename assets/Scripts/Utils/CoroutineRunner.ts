function* waitSeconds(duration: number) {

    let start = Date.now();

    while (duration > 0) {
        const current = Date.now();
        const dt = current - start;
        start = current;
        duration -= dt;
        yield;
    }
}

export class CoroutineRunner {
    private generatorStacks: any[];
    private removeQueue: Set<any>;
    private addQueue: any[];

    constructor() {
        this.generatorStacks = [];
        this.addQueue = [];
        this.removeQueue = new Set();
    }

    isBusy() {
        return this.addQueue.length + this.generatorStacks.length > 0;
    }

    add(generator: Generator, delay = 0) {
        const genStack = [generator];
        if (delay) {
            genStack.push(waitSeconds(delay));
        }
        this.addQueue.push(genStack);
    }

    remove(generator: Generator) {
        this.removeQueue.add(generator);
    }

    update() {
        this._addQueued();
        this._removeQueued();
        for (const genStack of this.generatorStacks) {
            const main = genStack[0];
            // Handle if one coroutine removes another
            if (this.removeQueue.has(main)) {
                continue;
            }
            while (genStack.length) {
                const topGen = genStack[genStack.length - 1];
                const { value, done } = topGen.next();
                if (done) {
                    if (genStack.length === 1) {
                        this.removeQueue.add(topGen);
                        break;
                    }
                    genStack.pop();
                } else if (value) {
                    genStack.push(value);
                } else {
                    break;
                }
            }
        }
        this._removeQueued();
    }

    _addQueued() {
        if (this.addQueue.length) {
            this.generatorStacks.splice(this.generatorStacks.length, 0, ...this.addQueue);
            this.addQueue = [];
        }
    }

    _removeQueued() {
        if (this.removeQueue.size) {
            this.generatorStacks = this.generatorStacks.filter(genStack => !this.removeQueue.has(genStack[0]));
            this.removeQueue.clear();
        }
    }
}