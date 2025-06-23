# DOCX Template Generator

แอปพลิเคชันสำหรับสร้างไฟล์ .docx จาก template 

## คุณสมบัติ

✅ **Custom Template Support** - อัปโหลดและใช้ template ที่ออกแบบเอง  
✅ **รองรับการจัดรูปแบบที่ซับซ้อน** - Template สามารถมี formatting ที่ซับซ้อนได้  
✅ **Auto Placeholder Detection** - ตรวจจับ {variable} อัตโนมัติ  

## การติดตั้ง

```
npm install
```

## การใช้งาน

### 1\. เริ่มต้นเซิร์ฟเวอร์

```
npm start
```

เซิร์ฟเวอร์จะทำงานที่ `http://localhost:5555`

### 2\. อัปโหลด Template

*   เข้าไปที่ `http://localhost:5555`
*   อัปโหลดไฟล์ .docx template ที่มี placeholders เช่น `{name}`, `{date}`, `{company}` เป็นต้น

### 3\. สร้างเอกสารใหม่

#### วิธีที่ 1: ใช้ GET request กับ URL parameters

```
GET /api/generate/template-name?name=John&date=2024-01-01&company=ABC
```

#### วิธีที่ 2: ใช้ POST request กับ JSON data

```
curl -X POST http://localhost:5555/api/generate/template-name \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "date": "2024-01-01", "company": "ABC"}' \
  --output generated.docx
```

## API Endpoints

### GET `/`

*   หน้าแรกสำหรับอัปโหลด template และดู templates ที่มีอยู่

### POST `/upload`

*   อัปโหลด DOCX template
*   ต้องส่งไฟล์ในฟิลด์ `template`

### GET `/api/templates`

*   แสดงรายการ templates ที่มีอยู่และ fields ที่รองรับ

### GET `/api/generate/{templateId}`

*   สร้างเอกสารจาก template โดยใช้ query parameters
*   ส่งคืนไฟล์ .docx ที่พร้อมดาวน์โหลด

### POST `/api/generate/{templateId}`

*   สร้างเอกสารจาก template โดยใช้ JSON data ใน request body
*   ส่งคืนไฟล์ .docx ที่พร้อมดาวน์โหลด

### GET `/api/template/{templateId}`

*   ดูรายละเอียด template และ sample data

### GET `/api/placeholders/{templateName}`

*   ดู placeholders ที่มีใน template

## การเตรียม Template

1.  สร้างไฟล์ .docx ใน Microsoft Word หรือ LibreOffice Writer
2.  ใช้ placeholders ในรูปแบบ `{variableName}`
3.  ตัวอย่าง:

**สำคัญ**: easy-template-x ใช้ `{variable}` ไม่ใช่ `{{variable}}`

## โครงสร้างโฟลเดอร์

```
docs-generator/
├── server-docx.js      # ไฟล์หลักของเซิร์ฟเวอร์
├── package.json       # ข้อมูล dependencies
├── templates/         # โฟลเดอร์เก็บ template files
├── output/           # โฟลเดอร์เก็บไฟล์ที่สร้างแล้ว (backup)
└── README.md         # ไฟล์คำแนะนำนี้
```

## Dependencies

*   **express**: Web framework
*   **easy-template-x**: Modern DOCX template processing library
*   **fs-extra**: File system utilities
*   **multer**: สำหรับอัปโหลดไฟล์

## ตัวอย่างการใช้งาน

สร้างไฟล์ template.docx ที่มีเนื้อหา:

อัปโหลดไฟล์ผ่าน web interface

เรียกใช้ API:

ได้ไฟล์ .docx ใหม่ที่มีเนื้อหาถูกแทนที่แล้ว

## การพัฒนา

```
npm run dev  # สำหรับ development mode ด้วย nodemon
```

## Changelog

### v2.0.0

*   เปลี่ยนจาก docxtemplater เป็น easy-template-x
*   ลบ direct generation ออก เหลือเฉพาะ template-based
*   เปลี่ยน placeholder syntax จาก `{{var}}` เป็น `{var}`
*   ปรับปรุง error handling และ logging
*   ลดความซับซ้อนของโค้ด

```
http://localhost:5555/api/generate/template?customerName=บริษัท ABC&date=2024-01-01&price=10000
```

```
ใบเสนอราคา

ลูกค้า: {customerName}
วันที่: {date}
ราคา: {price} บาท
```

```
สวัสดี {name}
วันที่: {date}
บริษัท: {company}
```