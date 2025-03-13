const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// إنشاء مجلد "public" إذا لم يكن موجودًا
const publicDir = path.join(__dirname, "public");
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

// إعداد Multer لحفظ الملفات مؤقتًا
const upload = multer({ dest: "uploads/" });

// مفتاح API (ثابت في الكود)
const REMOVE_BG_API_KEY = "nb2A2cXYZFRtdpsWN6sRZFZr";

// عرض صفحة HTML عند الدخول إلى الموقع
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// معالجة رفع الصور وإزالة الخلفية
app.post("/remove-bg", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.send("يرجى تحميل صورة!");
    }

    try {
        const response = await axios.post(
            "https://api.remove.bg/v1.0/removebg",
            {
                image_file: fs.createReadStream(req.file.path),
                size: "auto",
            },
            {
                headers: {
                    "X-Api-Key": REMOVE_BG_API_KEY,
                    "Content-Type": "multipart/form-data",
                },
                responseType: "arraybuffer",
            }
        );

        // حفظ الصورة المعالجة
        const outputPath = path.join(publicDir, "output.png");
        fs.writeFileSync(outputPath, response.data);

        // إظهار الصورة في الصفحة
        res.send(`
            <h2>تمت إزالة الخلفية بنجاح!</h2>
            <img src="/output.png" alt="الصورة المعالجة" style="width:100%;max-width:500px;border-radius:10px;">
            <br><br>
            <a href="/output.png" download="no-bg.png">
                <button style="padding:10px 20px;background:#4CAF50;color:white;border:none;border-radius:5px;cursor:pointer;">
                    تحميل الصورة
                </button>
            </a>
            <br><br>
            <a href="/">🔄 العودة</a>
        `);
    } catch (error) {
        console.error(error);
        res.send("حدث خطأ أثناء إزالة الخلفية!");
    } finally {
        fs.unlinkSync(req.file.path); // حذف الملف الأصلي
    }
});

// تقديم الملفات الثابتة (للصور المعالجة)
app.use(express.static("public"));

// تشغيل السيرفر
app.listen(port, () => {
    console.log(`السيرفر يعمل على http://localhost:${port}`);
});
