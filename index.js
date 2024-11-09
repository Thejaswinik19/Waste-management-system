const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// In-memory data structures
const complaintQueue = [];
const complaintHistory = [];
let availableVehicles = ["Vehicle-1", "Vehicle-2"];
let waitingComplaints = [];

// Function to add a complaint and sort by priority
function addComplaint(id, description, priority, location) {
    const complaint = { id, description, priority: parseInt(priority), location, status: 'Pending' };
    complaintQueue.push(complaint);
    complaintQueue.sort((a, b) => b.priority - a.priority); // Higher priority first
}

// Function to remove a complaint (stack operation)
function removeComplaint(id) {
    const index = complaintQueue.findIndex(c => c.id === id);
    if (index !== -1) {
        const removedComplaint = complaintQueue.splice(index, 1)[0];
        console.log(`Complaint '${removedComplaint.description}' removed from the queue.`);
        return removedComplaint;
    }
    return null; // Complaint not found
}

// Function to log complaints to a daily .csv file
function logComplaint(complaint, statusMessage) {
    const today = new Date().toISOString().split('T')[0];
    const filePath = path.join(__dirname, `complaints_log_${today}.csv`);
    const csvLine = `${complaint.id},${complaint.description},${complaint.priority},${complaint.location},${new Date().toISOString()},${statusMessage}\n`;

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, 'ID,Description,Priority,Location,Time,Status\n');
    }

    fs.appendFileSync(filePath, csvLine, 'utf8');
}

// Function to resolve complaints with prioritized vehicle assignment
async function resolveComplaints() {
    console.log("Starting complaint resolution...");

    // Step 1: Assign available vehicles to highest-priority complaints immediately and log assignments
    while (availableVehicles.length > 0 && complaintQueue.length > 0) {
        const vehicleId = availableVehicles.shift();
        const complaint = complaintQueue.shift();

        complaint.status = 'In Progress';
        complaint.vehicle = vehicleId;
        logComplaint(complaint, `Assigned, Vehicle: ${vehicleId}`);
        console.log(`Assigned ${vehicleId} to complaint '${complaint.description}' with priority ${complaint.priority}.`);

        // Queue the complaint to be resolved after a delay
        setTimeout(() => resolveSingleComplaint(complaint, vehicleId), 10000);
    }

    // Step 2: Handle waiting complaints if no vehicles are available
    if (complaintQueue.length > 0 && availableVehicles.length === 0) {
        console.log("No available vehicles. Waiting complaints will be processed as vehicles become available.");
        waitingComplaints = complaintQueue.splice(0); // Move remaining complaints to waiting list
    }
}

// Function to resolve a single complaint and reassign the vehicle to waiting complaints
async function resolveSingleComplaint(complaint, vehicleId) {
    complaint.status = 'Resolved';
    logComplaint(complaint, `Resolved, Vehicle: ${vehicleId}`);
    complaintHistory.push(complaint);
    console.log(`Complaint '${complaint.description}' resolved. ${vehicleId} is now available.`);

    availableVehicles.push(vehicleId); // Mark vehicle as available

    // Reassign vehicle to the next waiting complaint if any exist
    if (waitingComplaints.length > 0) {
        const nextComplaint = waitingComplaints.shift();
        nextComplaint.status = 'In Progress';
        nextComplaint.vehicle = vehicleId;
        logComplaint(nextComplaint, `Assigned, Vehicle: ${vehicleId}`);
        console.log(`Assigned ${vehicleId} to waiting complaint '${nextComplaint.description}' with priority ${nextComplaint.priority}.`);

        // Queue resolution for the newly assigned complaint
        setTimeout(() => resolveSingleComplaint(nextComplaint, vehicleId), 10000);
    }
}

// Endpoint to add a complaint
app.get('/add-complaint', (req, res) => {
    const { id, description, priority, location } = req.query;
    if (!id || !description || !priority || !location) {
        return res.status(400).json({ message: "Please provide id, description, priority, and location." });
    }
    addComplaint(id, description, priority, location);
    res.json({ message: `Complaint '${description}' added with priority ${priority}.` });
});

// Endpoint to manually remove a complaint (stack operation)
app.get('/remove-complaint', (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ message: "Please provide complaint id." });
    }
    const removedComplaint = removeComplaint(id);
    if (removedComplaint) {
        res.json({ message: `Complaint '${removedComplaint.description}' removed from the queue.` });
    } else {
        res.status(404).json({ message: "Complaint not found." });
    }
});

// Endpoint to manually resolve complaints (GET)
app.get('/resolve-complaints', (req, res) => {
    if (complaintQueue.length === 0) {
        return res.json({ message: "No complaints to resolve." });
    }
    resolveComplaints(); // Start processing complaints on trigger
    res.json({ message: "Started resolving complaints based on priority and vehicle availability." });
});

// Endpoint to view unresolved complaints
app.get('/view-complaints', (req, res) => {
    res.json(complaintQueue);
});

// Endpoint to view resolved complaint history
app.get('/view-history', (req, res) => {
    res.json(complaintHistory);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
