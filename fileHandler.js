// fileHandler.js
const fs = require('fs');
const path = require('path');

function logResolvedComplaints(resolvedComplaints) {
    const filePath = path.join(__dirname, 'resolved_complaints.csv');
    const headers = "ID,Description,Priority,Location,Timestamp\n";
    let data = resolvedComplaints.map(c => `${c.id},${c.description},${c.priority},${c.location},${c.timestamp}`).join('\n');
    
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, headers + data);
    } else {
        fs.appendFileSync(filePath, '\n' + data);
    }
}

module.exports = { logResolvedComplaints };
