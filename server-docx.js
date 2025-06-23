const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const { extractPlaceholders, getCustomTemplates, generateFromTemplate } = require('./utils/templateUtils');

const app = express();
const PORT = process.env.PORT || 5555;

// Valid tokens (in production, use environment variables or database)
const VALID_TOKENS = [
    'tk_7x9m2p4q8r1n6v3z5c8b1a4d7f0g2h9',
    'auth_k5w8j3h9f2d7s6a1c4x7v0b3n6m9q2',
    'api_9b4n7c2x5v8m1q3r6t9y2e5h8k1p4w7',
    'sec_3f6h9k2m5p8t1w4y7r0u3i6o9l2s5d8'
];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic authentication middleware for pages
function basicAuthPage(req, res, next) {
    const auth = req.headers.authorization;
    
    if (!auth || !auth.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="DOCX Template Generator"');
        return res.status(401).send('Authentication required');
    }
    
    const credentials = Buffer.from(auth.slice(6), 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');
    
    // Check if username:password combination is valid
    // Using tokens as passwords with 'api' as username
    if (username !== 'api' || !VALID_TOKENS.includes(password)) {
        res.setHeader('WWW-Authenticate', 'Basic realm="DOCX Template Generator"');
        return res.status(401).send('Invalid credentials');
    }
    
    req.token = password;
    next();
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'templates/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Ensure directories exist
fs.ensureDirSync('output');
fs.ensureDirSync('templates');

// Routes

// Serve static files (no auth required for CSS)
app.use('/style.css', express.static(path.join(__dirname, 'views', 'style.css')));

// Authentication pages (no token required)
app.get('/login', (req, res) => {
  console.log('🔐 Login page requested');
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/error', (req, res) => {
  console.log('❌ Error page requested');
  res.sendFile(path.join(__dirname, 'views', 'error.html'));
});

// Protected pages (require basic auth)
app.get('/', basicAuthPage, (req, res) => {
  console.log(`🏠 Home page accessed by token: ${req.token.substring(0, 8)}...`);
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/about', basicAuthPage, (req, res) => {
  console.log(`ℹ️ About page accessed by token: ${req.token.substring(0, 8)}...`);
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/docs', basicAuthPage, (req, res) => {
  console.log(`📖 Docs page accessed by token: ${req.token.substring(0, 8)}...`);
  res.sendFile(path.join(__dirname, 'views', 'docs.html'));
});

// Upload template (requires basic auth)
app.post('/upload', basicAuthPage, upload.single('template'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  console.log(`✅ Template uploaded by token: ${req.token.substring(0, 8)}...`);
  
  res.json({ 
    message: 'Template uploaded successfully', 
    filename: req.file.filename,
    templateId: path.parse(req.file.filename).name
  });
});

// List available templates (requires basic auth)
app.get('/api/templates', basicAuthPage, async (req, res) => {
  try {
    const customTemplates = await getCustomTemplates();
    
    console.log(`📋 Templates requested by token: ${req.token.substring(0, 8)}...`);
    
    res.json({
      templates: Object.keys(customTemplates).map(key => ({
        id: key,
        name: customTemplates[key].name,
        description: customTemplates[key].description,
        type: customTemplates[key].type,
        fields: customTemplates[key].fields
      }))
    });
  } catch (error) {
    console.error('Error listing templates:', error);
    res.status(500).json({ error: 'Failed to list templates' });
  }
});

// Generate document (POST) - requires basic auth
app.post('/api/generate/:templateId', basicAuthPage, async (req, res) => {
  try {
    const templateId = req.params.templateId;
    const data = req.body;
    
    console.log(`📄 Document generation requested by token: ${req.token.substring(0, 8)}... for template: ${templateId}`);
    
    // Generate from template file
    const buffer = await generateFromTemplate(templateId + '.docx', data);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${templateId}_${timestamp}.docx`;
    
    const outputPath = path.join('output', filename);
    await fs.writeFile(outputPath, buffer);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
    
  } catch (error) {
    console.error('❌ Error generating document:', error);
    res.status(500).json({ 
      error: 'Failed to generate document', 
      details: error.message 
    });
  }
});

// Generate document (GET) - requires basic auth
app.get('/api/generate/:templateId', basicAuthPage, async (req, res) => {
  try {
    const templateId = req.params.templateId;
    const data = req.query;
    
    console.log(`📄 Document generation (GET) requested by token: ${req.token.substring(0, 8)}... for template: ${templateId}`);
    
    // Generate from template file
    const buffer = await generateFromTemplate(templateId + '.docx', data);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${templateId}_${timestamp}.docx`;
    
    const outputPath = path.join('output', filename);
    await fs.writeFile(outputPath, buffer);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
    
  } catch (error) {
    console.error('❌ Error generating document:', error);
    res.status(500).json({ 
      error: 'Failed to generate document', 
      details: error.message 
    });
  }
});

// Get template schema (requires basic auth)
app.get('/api/template/:templateId', basicAuthPage, async (req, res) => {
  try {
    const templateId = req.params.templateId;
    const customTemplates = await getCustomTemplates();
    const template = customTemplates[templateId];
    
    if (!template) {
      return res.status(404).json({ 
        error: 'Template not found',
        availableTemplates: Object.keys(customTemplates)
      });
    }
    
    console.log(`🔍 Template schema requested by token: ${req.token.substring(0, 8)}... for template: ${templateId}`);
    
    res.json({
      templateId,
      config: template,
      sampleData: template.fields.reduce((obj, field) => {
        if (field.type === 'string') {
          obj[field.name] = `example_${field.name}`;
        } else if (field.type === 'number') {
          obj[field.name] = 100;
        }
        return obj;
      }, {})
    });
  } catch (error) {
    console.error('Error getting template schema:', error);
    res.status(500).json({ error: 'Failed to get template schema' });
  }
});

// Get placeholders from uploaded template (requires basic auth)
app.get('/api/placeholders/:templateName', basicAuthPage, async (req, res) => {
  try {
    const templateName = req.params.templateName;
    const templatePath = path.join('templates', templateName);
    
    if (!await fs.pathExists(templatePath)) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    console.log(`🔧 Placeholders extraction requested by token: ${req.token.substring(0, 8)}... for template: ${templateName}`);
    
    const placeholders = await extractPlaceholders(templatePath);
    
    res.json({
      templateName,
      placeholders,
      totalPlaceholders: placeholders.length,
      sampleUrl: `/api/generate/${path.parse(templateName).name}?${placeholders.map(p => `${p}=example_${p}`).join('&')}`,
      sampleData: placeholders.reduce((obj, placeholder) => {
        obj[placeholder] = `example_${placeholder}`;
        return obj;
      }, {})
    });
    
  } catch (error) {
    console.error('Error extracting placeholders:', error);
    res.status(500).json({ 
      error: 'Failed to extract placeholders', 
      details: error.message 
    });
  }
});

// Token validation endpoint
app.post('/api/validate-token', (req, res) => {
  const token = req.body.token || req.query.token;
  
  if (!token) {
    return res.status(400).json({ 
      valid: false, 
      message: 'Token is required' 
    });
  }
  
  const isValid = VALID_TOKENS.includes(token);
  
  res.json({
    valid: isValid,
    message: isValid ? 'Token is valid' : 'Invalid token'
  });
});

// Health check endpoint (no token required)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DOCX Template Generator running on http://localhost:${PORT}`);
  console.log(`🔐 HTTP Basic Authentication is enabled`);
}); 