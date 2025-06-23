const fs = require('fs-extra');
const path = require('path');
const { TemplateHandler } = require('easy-template-x');

/**
 * Extract placeholders from DOCX template (syntax {variable})
 * @param {string} templatePath - Path to .docx template file
 * @returns {Promise<string[]>} Unique placeholder names
 */
async function extractPlaceholders(templatePath) {
  try {
    const buffer = await fs.readFile(templatePath);
    const handler = new TemplateHandler();
    const docText = await handler.getText(buffer);

    const matches = docText.match(/\{([^}]+)\}/g) || [];
    const placeholders = matches
      .map((m) => m.replace(/[{}]/g, '').trim())
      .filter((v) => v.match(/^[a-zA-Z_!][a-zA-Z0-9_\.]*$/))
      .filter((v) => !v.startsWith('!')); // ไม่รวมตัวแปรที่ขึ้นต้นด้วย !

    return [...new Set(placeholders)];
  } catch (err) {
    console.error('Error extracting placeholders:', err);
    return [];
  }
}

/**
 * Scan templates directory and build template config objects
 * @returns {Promise<object>} key -> template metadata
 */
async function getCustomTemplates() {
  try {
    const files = await fs.readdir('templates');
    const docxFiles = files.filter((f) => f.endsWith('.docx'));
    const customTemplates = {};

    for (const file of docxFiles) {
      const filePath = path.join('templates', file);
      const placeholders = await extractPlaceholders(filePath);
      const templateId = path.parse(file).name;

      customTemplates[templateId] = {
        name: file,
        description: `Custom template: ${file}`,
        type: 'template',
        filename: file,
        fields: placeholders.map((p) => ({
          name: p,
          type: 'string',
          description: `Field: ${p}`,
          required: false,
        })),
      };
    }

    return customTemplates;
  } catch (err) {
    console.error('Error reading custom templates:', err);
    return {};
  }
}

/**
 * Generate a DOCX buffer from template file and data
 * @param {string} templateId - template file id (with .docx extension)
 * @param {object} data - data to inject
 * @returns {Promise<Buffer>} generated docx buffer
 */
async function generateFromTemplate(templateId, data) {
  if (!templateId) throw new Error(`Template not found: ${templateId}`);
  const templatePath = path.join('templates', templateId);
  if (!(await fs.pathExists(templatePath))) throw new Error(`Template file not found: ${templatePath}`);

  // ดึง placeholders ทั้งหมดจาก template (ไม่รวมตัวแปรที่ขึ้นต้นด้วย !)
  const placeholders = await extractPlaceholders(templatePath);
  
  // สร้าง data object ที่ครบถ้วน โดยแทนที่ตัวแปรที่ไม่มีด้วยจุด
  const completeData = { ...data };
  placeholders.forEach(placeholder => {
    if (completeData[placeholder] === undefined || completeData[placeholder] === null || completeData[placeholder] === '') {
      completeData[placeholder] = '...........';
    }
  });

  // เพิ่มการจัดการตัวแปร {!var} ให้แสดงเป็น {var}
  const buffer = await fs.readFile(templatePath);
  const handler = new TemplateHandler();
  const docText = await handler.getText(buffer);
  
  // ค้นหาตัวแปรที่ขึ้นต้นด้วย ! และเพิ่มเข้า completeData
  const literalMatches = docText.match(/\{!([^}]+)\}/g) || [];
  literalMatches.forEach(match => {
    const varName = match.replace(/[{}!]/g, '').trim();
    const fullVarName = '!' + varName;
    completeData[fullVarName] = '{' + varName + '}'; // แทนที่ {!var} ด้วย {var}
  });

  const templateFile = await fs.readFile(templatePath);
  return handler.process(templateFile, completeData);
}

module.exports = {
  extractPlaceholders,
  getCustomTemplates,
  generateFromTemplate,
}; 