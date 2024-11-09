// complaintStack.js
class ComplaintStack {
    constructor() {
        this.stack = [];
    }

    // Push resolved complaint to stack
    push(complaint) {
        this.stack.push(complaint);
    }

    // Remove and return the most recently resolved complaint
    pop() {
        return this.stack.pop();
    }

    getHistory() {
        return this.stack;
    }
}

module.exports = ComplaintStack;