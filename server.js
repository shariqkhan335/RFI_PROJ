const express = require('express');
const path = require('path');
const fs = require('fs/promises'); // Use fs.promises for async file operations
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// API endpoint: Health check
app.get('/health', (req, res) => {
  res.send('OK');
});

// Helper function to read JSON data
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`File not found: ${filePath}. Returning empty array.`);
      return []; // Return empty array if file doesn't exist
    }
    console.error(`Error reading ${filePath}:`, error);
    throw error;
  }
}

// Helper function to write JSON data
async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    throw error;
  }
}

// API endpoint: Get all assessments
app.get('/api/assessments', async (req, res) => {
  try {
    const assessments = await readJsonFile(path.join(__dirname, 'public', 'data', 'assessments.json'));
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve assessments' });
  }
});

// API endpoint: Add a new assessment
app.post('/api/assessments', async (req, res) => {
  try {
    const newAssessment = req.body;
    if (!newAssessment.processName || !newAssessment.status) {
      return res.status(400).json({ error: 'Process Name and Status are required.' });
    }

    const assessmentsFilePath = path.join(__dirname, 'public', 'data', 'assessments.json');
    const assessments = await readJsonFile(assessmentsFilePath);

    // Assign a simple ID for the prototype
    newAssessment.id = Date.now().toString(); // Unique ID based on timestamp
    newAssessment.createdDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    newAssessment.lastModified = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    assessments.push(newAssessment);
    await writeJsonFile(assessmentsFilePath, assessments);
    res.status(201).json(newAssessment);
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// API endpoint: Update an existing assessment
app.put('/api/assessments/:id', async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const updatedAssessmentData = req.body;
    if (!updatedAssessmentData.processName || !updatedAssessmentData.status) {
      return res.status(400).json({ error: 'Process Name and Status are required.' });
    }

    const assessmentsFilePath = path.join(__dirname, 'public', 'data', 'assessments.json');
    let assessments = await readJsonFile(assessmentsFilePath);

    const index = assessments.findIndex(a => a.id === assessmentId);

    if (index === -1) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Preserve original ID and creation date, update other fields
    assessments[index] = {
      ...assessments[index],
      ...updatedAssessmentData,
      id: assessmentId, // Ensure ID remains the same
      lastModified: new Date().toISOString().split('T')[0] // Update last modified date
    };

    await writeJsonFile(assessmentsFilePath, assessments);
    res.json(assessments[index]);
  } catch (error) {
    console.error('Error updating assessment:', error);
    res.status(500).json({ error: 'Failed to update assessment' });
  }
});

// API endpoint: Get all RFIs
app.get('/api/rfis', async (req, res) => {
  try {
    const rfis = await readJsonFile(path.join(__dirname, 'public', 'data', 'rfis.json'));
    res.json(rfis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve RFIs' });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});