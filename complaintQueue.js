// complaintQueue.js
class Complaint {
    constructor(id, description, priority, location) {
        this.id = id;
        this.description = description;
        this.priority = priority;
        this.location = location;
        this.timestamp = new Date();
    }
}

class ComplaintQueue {
    constructor() {
        this.queue = [];
    }

    // Insert complaint based on priority
    enqueue(complaint) {
        let added = false;
        for (let i = 0; i < this.queue.length; i++) {
            if (complaint.priority > this.queue[i].priority) {
                this.queue.splice(i, 0, complaint);
                added = true;
                break;
            }
        }
        if (!added) this.queue.push(complaint);
    }

    // Remove and return the highest priority complaint
    dequeue() {
        return this.queue.shift();
    }

    isEmpty() {
        return this.queue.length === 0;
    }

    getComplaints() {
        return this.queue;
    }
}

module.exports = { Complaint, ComplaintQueue };