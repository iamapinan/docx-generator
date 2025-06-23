# DOCX Template Generator

แอปพลิเคชันสำหรับสร้างไฟล์ .docx จาก template พร้อมระบบ authentication

## คุณสมบัติ

✅ **Custom Template Support** - อัปโหลดและใช้ template ที่ออกแบบเอง  
✅ **รองรับการจัดรูปแบบที่ซับซ้อน** - Template สามารถมี formatting ที่ซับซ้อนได้  
✅ **Auto Placeholder Detection** - ตรวจจับ {variable} อัตโนมัติ  
✅ **HTTP Basic Authentication** - ระบบยืนยันตัวตนแบบมาตรฐาน  
✅ **Responsive Web Interface** - ใช้งานได้ทุกอุปกรณ์  
✅ **RESTful API** - API ที่ง่ายต่อการใช้งาน  

## การติดตั้ง

```bash
npm install
```

### การตั้งค่า Environment Variables (แนะนำ)

สำหรับความปลอดภัย ควรตั้งค่า tokens ผ่าน environment variables:

```bash
# คัดลอกไฟล์ตัวอย่าง
cp config.example.env .env

# แก้ไขไฟล์ .env ตามต้องการ
nano .env
```

หรือตั้งค่าโดยตรง:

```bash
export TOKEN_1="your_secure_token_1"
export TOKEN_2="your_secure_token_2"
export TOKEN_3="your_secure_token_3"
export TOKEN_4="your_secure_token_4"
export PORT=5555
```

**หมายเหตุ**: หากไม่ตั้งค่า environment variables ระบบจะใช้ default tokens (ไม่แนะนำสำหรับ production)

## การใช้งาน

### 1. เริ่มต้นเซิร์ฟเวอร์

```bash
npm start
```

เซิร์ฟเวอร์จะทำงานที่ `http://localhost:5555`

### 2. Authentication

ระบบใช้ HTTP Basic Authentication:
- **Username**: `api`
- **Password**: ใช้ token ใดๆ ที่ตั้งค่าไว้

#### Default Tokens (หากไม่ได้ตั้งค่า environment variables):
- `tk_7x9m2p4q8r1n6v3z5c8b1a4d7f0g2h9`
- `auth_k5w8j3h9f2d7s6a1c4x7v0b3n6m9q2`
- `api_9b4n7c2x5v8m1q3r6t9y2e5h8k1p4w7`
- `sec_3f6h9k2m5p8t1w4y7r0u3i6o9l2s5d8`

#### การตั้งค่า Environment Variables:
```bash
# ตัวอย่างการตั้งค่า tokens ที่ปลอดภัย
TOKEN_1="prod_secret_key_xyz123"
TOKEN_2="api_access_abc789" 
TOKEN_3="admin_token_def456"
TOKEN_4="user_key_ghi012"
```

### 3. เข้าใช้งาน Web Interface

1. เข้าไปที่ `http://localhost:5555`
2. Browser จะแสดง authentication popup
3. กรอก Username: `api`
4. กรอก Password: token ใดๆ เช่น `tk_7x9m2p4q8r1n6v3z5c8b1a4d7f0g2h9`

### 4. อัปโหลด Template

- อัปโหลดไฟล์ .docx template ที่มี placeholders เช่น `{name}`, `{date}`, `{company}` ผ่าน web interface
- กดปุ่ม floating action button (📤) เพื่อเปิด modal อัปโหลด

### 5. สร้างเอกสารใหม่

#### วิธีที่ 1: ใช้ GET request กับ URL parameters

```bash
curl -u "api:tk_7x9m2p4q8r1n6v3z5c8b1a4d7f0g2h9" \
  "http://localhost:5555/api/generate/template-name?name=John&date=2024-01-01&company=ABC" \
  --output generated.docx
```

#### วิธีที่ 2: ใช้ POST request กับ JSON data

```bash
curl -u "api:tk_7x9m2p4q8r1n6v3z5c8b1a4d7f0g2h9" \
  -X POST "http://localhost:5555/api/generate/template-name" \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "date": "2024-01-01", "company": "ABC"}' \
  --output generated.docx
```

## API Endpoints

> 🔒 **หมายเหตุ**: API ทั้งหมดต้องใช้ HTTP Basic Authentication

### GET `/`
- หน้าแรกสำหรับอัปโหลด template และดู templates ที่มีอยู่
- ต้อง authentication

### GET `/about`
- หน้าข้อมูลเกี่ยวกับระบบ
- ต้อง authentication

### GET `/docs`
- หน้า documentation
- ต้อง authentication

### POST `/upload`
- อัปโหลด DOCX template
- ต้องส่งไฟล์ในฟิลด์ `template`
- ต้อง authentication

```bash
curl -u "api:token_here" \
  -X POST "http://localhost:5555/upload" \
  -F "template=@your-template.docx"
```

### GET `/api/templates`
- แสดงรายการ templates ที่มีอยู่และ fields ที่รองรับ
- ต้อง authentication

```bash
curl -u "api:token_here" "http://localhost:5555/api/templates"
```

### GET `/api/generate/{templateId}`
- สร้างเอกสารจาก template โดยใช้ query parameters
- ส่งคืนไฟล์ .docx ที่พร้อมดาวน์โหลด
- ต้อง authentication

### POST `/api/generate/{templateId}`
- สร้างเอกสารจาก template โดยใช้ JSON data ใน request body
- ส่งคืนไฟล์ .docx ที่พร้อมดาวน์โหลด
- ต้อง authentication

### GET `/api/template/{templateId}`
- ดูรายละเอียด template และ sample data
- ต้อง authentication

### GET `/api/placeholders/{templateName}`
- ดู placeholders ที่มีใน template
- ต้อง authentication

### POST `/api/validate-token`
- ตรวจสอบความถูกต้องของ token
- ไม่ต้อง authentication

```bash
curl -X POST "http://localhost:5555/api/validate-token" \
  -H "Content-Type: application/json" \
  -d '{"token":"tk_7x9m2p4q8r1n6v3z5c8b1a4d7f0g2h9"}'
```

### GET `/api/health`
- Health check endpoint
- ไม่ต้อง authentication

## การเตรียม Template

1. สร้างไฟล์ .docx ใน Microsoft Word หรือ LibreOffice Writer
2. ใช้ placeholders ในรูปแบบ `{variableName}`
3. ตัวอย่าง:

```
สวัสดี {name}
วันที่: {date}
บริษัท: {company}
```

```
ใบเสนอราคา

ลูกค้า: {customerName}
วันที่: {date}
ราคา: {price} บาท
```

**สำคัญ**: easy-template-x ใช้ `{variable}` ไม่ใช่ `{{variable}}`

### การจัดการข้อมูลที่ไม่ครบ

✨ **ฟีเจอร์ใหม่**: หากในการส่งข้อมูลไม่ได้ส่งตัวแปรบางตัวที่มีใน template มา ระบบจะแทนที่ด้วย `...........` โดยอัตโนมัติ

**ตัวอย่าง**:
- Template มี: `{name}`, `{lastname}`, `{year}`
- ส่งข้อมูลมาเฉพาะ: `{"name": "สมชาย"}`
- ผลลัพธ์: 
  - `{name}` → "สมชาย"
  - `{lastname}` → "..........."
  - `{year}` → "..........."

```bash
# ตัวอย่างการส่งข้อมูลไม่ครบ
curl -u "api:your_token" \
  -X POST "http://localhost:5555/api/generate/template" \
  -H "Content-Type: application/json" \
  -d '{"name": "สมชาย"}' \
  --output document.docx
```

## โครงสร้างโฟลเดอร์

```
docs-generator/
├── server-docx.js      # ไฟล์หลักของเซิร์ฟเวอร์
├── package.json       # ข้อมูล dependencies
├── templates/         # โฟลเดอร์เก็บ template files
├── output/           # โฟลเดอร์เก็บไฟล์ที่สร้างแล้ว (backup)
├── views/            # ไฟล์ HTML และ CSS
│   ├── index.html    # หน้าแรก
│   ├── about.html    # หน้าเกี่ยวกับ
│   ├── docs.html     # หน้า documentation
│   └── style.css     # CSS styles
├── utils/            # Utilities
│   └── templateUtils.js
└── README.md         # ไฟล์คำแนะนำนี้
```

## Dependencies

- **express**: Web framework
- **easy-template-x**: Modern DOCX template processing library
- **fs-extra**: File system utilities
- **multer**: สำหรับอัปโหลดไฟล์

## Docker Support

### การใช้งานด้วย Docker

```bash
# Build image
docker build -t docx-generator .

# Run container with default tokens
docker run -p 5555:5555 docx-generator

# Run container with custom tokens
docker run -p 5555:5555 \
  -e TOKEN_1="your_secure_token_1" \
  -e TOKEN_2="your_secure_token_2" \
  -e TOKEN_3="your_secure_token_3" \
  -e TOKEN_4="your_secure_token_4" \
  docx-generator
```

### การใช้งานด้วย Docker Compose

```bash
# แก้ไขไฟล์ docker-compose.yml เพื่อเพิ่ม environment variables
docker-compose up -d
```

#### ตัวอย่าง docker-compose.yml with environment variables:

```yaml
version: '3.8'
services:
  docx-generator:
    build: .
    ports:
      - "5555:5555"
    environment:
      - TOKEN_1=prod_secret_key_xyz123
      - TOKEN_2=api_access_abc789  
      - TOKEN_3=admin_token_def456
      - TOKEN_4=user_key_ghi012
      - PORT=5555
```

## Security

- ใช้ HTTP Basic Authentication สำหรับทุก protected endpoints
- Token-based access control
- ใน production ควรใช้ HTTPS
- Tokens ควรเก็บใน environment variables หรือ database

### Production Best Practices

1. **ตั้งค่า Environment Variables**:
   ```bash
   export TOKEN_1="super_secure_production_key_123"
   export TOKEN_2="another_secure_api_key_456"
   export TOKEN_3="admin_access_token_789"
   export TOKEN_4="backup_key_012"
   ```

2. **ใช้ HTTPS**:
   ```bash
   # ใช้ reverse proxy เช่น nginx หรือ apache
   # หรือใช้ load balancer ที่รองรับ SSL termination
   ```

3. **ตั้งค่า PORT สำหรับ production**:
   ```bash
   export PORT=3000
   ```

4. **ตรวจสอบ Logs**:
   - ระบบจะแสดง logs การ process template
   - ตรวจสอบ fields ที่ไม่ได้ส่งมาและถูกแทนที่ด้วยจุด
   - ตรวจสอบการใช้งาน tokens

### การแทนที่ข้อมูลเปล่า

ระบบจะแทนที่ข้อมูลเปล่าด้วย `...........` ในกรณีต่อไปนี้:
- `undefined` 
- `null`
- `""` (string เปล่า)
- ไม่ได้ส่ง field มาเลย

## ตัวอย่างการใช้งาน

### 1. อัปโหลด Template ผ่าน Web

1. เข้า `http://localhost:5555`
2. Login ด้วย `api` / `tk_7x9m2p4q8r1n6v3z5c8b1a4d7f0g2h9`
3. กดปุ่ม 📤 เพื่ออัปโหลดไฟล์

### 2. สร้างเอกสารผ่าน API

```bash
# ดูรายการ templates
curl -u "api:tk_7x9m2p4q8r1n6v3z5c8b1a4d7f0g2h9" \
  "http://localhost:5555/api/templates"

# ดูรายละเอียด template เฉพาะ
curl -u "api:tk_7x9m2p4q8r1n6v3z5c8b1a4d7f0g2h9" \
  "http://localhost:5555/api/template/example"

# สร้างเอกสารพร้อมข้อมูลครบ (GET method)
curl -u "api:tk_7x9m2p4q8r1n6v3z5c8b1a4d7f0g2h9" \
  "http://localhost:5555/api/generate/example?name=สมชาย&lastname=ใจดี&year=2024" \
  --output document_full.docx

# สร้างเอกสารพร้อมข้อมูลครบ (POST method)
curl -u "api:tk_7x9m2p4q8r1n6v3z5c8b1a4d7f0g2h9" \
  -X POST "http://localhost:5555/api/generate/example" \
  -H "Content-Type: application/json" \
  -d '{"name": "สมชาย", "lastname": "ใจดี", "year": "2024"}' \
  --output document_full.docx

# สร้างเอกสารข้อมูลไม่ครบ (ตัวแปรที่ไม่มีจะเป็นจุด)
curl -u "api:tk_7x9m2p4q8r1n6v3z5c8b1a4d7f0g2h9" \
  -X POST "http://localhost:5555/api/generate/example" \
  -H "Content-Type: application/json" \
  -d '{"name": "สมชาย"}' \
  --output document_partial.docx
```

### 3. การตรวจสอบ Placeholders

```bash
# ดู placeholders ที่มีใน template
curl -u "api:tk_7x9m2p4q8r1n6v3z5c8b1a4d7f0g2h9" \
  "http://localhost:5555/api/placeholders/example.docx"
```

## การพัฒนา

```bash
npm run dev  # สำหรับ development mode ด้วย nodemon
```

### Debug และ Troubleshooting

1. **ตรวจสอบ Logs**:
   - เมื่อ process template ระบบจะแสดง:
     - รายชื่อ placeholders ที่พบใน template
     - ข้อมูลที่ได้รับจาก request
     - fields ที่ไม่มีข้อมูลและถูกแทนที่ด้วยจุด

2. **ตัวอย่าง Log Output**:
   ```
   📝 Processing template: example.docx
   🔧 Found placeholders: name, lastname, year
   📄 Data provided: name
   🔄 Missing fields filled with dots: lastname, year
   ```

3. **ตรวจสอบ Template**:
   ```bash
   # ดู placeholders ใน template
   curl -u "api:token" "http://localhost:5555/api/placeholders/template.docx"
   
   # ดูโครงสร้าง template
   curl -u "api:token" "http://localhost:5555/api/template/template-name"
   ```

4. **ทดสอบ Authentication**:
   ```bash
   # ตรวจสอบ token
   curl -X POST "http://localhost:5555/api/validate-token" \
     -H "Content-Type: application/json" \
     -d '{"token":"your_token"}'
   
   # ตรวจสอบ health
   curl "http://localhost:5555/api/health"
   ```

## Error Codes

- **400** - Bad Request (ไม่มีไฟล์อัปโหลดหรือข้อมูลไม่ครบ)
- **401** - Unauthorized (ไม่มี authentication หรือ credentials ไม่ถูกต้อง)
- **404** - Template Not Found
- **500** - Internal Server Error

## Changelog

### v3.1.0 (Current)
- เพิ่ม Environment Variables support สำหรับ tokens
- เพิ่มการแทนที่ตัวแปรที่ไม่ได้ส่งมาด้วย `...........` อัตโนมัติ
- เพิ่ม logging การ process template แบบละเอียด
- ปรับปรุง security guidelines
- อัปเดต Docker support ด้วย environment variables

### v3.0.0
- เพิ่ม HTTP Basic Authentication
- ปรับปรุง Web Interface ด้วย modern design
- เพิ่ม responsive design
- เพิ่ม modal upload system
- อัปเดต documentation
- ปรับปรุง error handling

### v2.0.0
- เปลี่ยนจาก docxtemplater เป็น easy-template-x
- ลบ direct generation ออก เหลือเฉพาะ template-based
- เปลี่ยน placeholder syntax จาก `{{var}}` เป็น `{var}`
- ปรับปรุง error handling และ logging
- ลดความซับซ้อนของโค้ด

## License

MIT License
