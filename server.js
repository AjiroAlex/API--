const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// إعداد multer لحفظ الصور مؤقتًا
const upload = multer({ dest: "uploads/" });

// مفتاح API مباشرة في الكود
const REMOVE_BG_API_KEY = "nb2A2cXYZFRtdpsWN6sRZFZr";

// نقطة نهاية لإزالة الخلفية
app.post("/remove-bg", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "لم يتم تحميل أي صورة!" });
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

        // حفظ الصورة وإرسالها للمستخدم
        const outputPath = path.join(__dirname, "output.png");
        fs.writeFileSync(outputPath, response.data);
        res.sendFile(outputPath);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "فشل في إزالة الخلفية!" });
    } finally {
        fs.unlinkSync(req.file.path); // حذف الملف الأصلي
    }
});

// نقطة اختبار
app.get("/", (req, res) => {
    res.json({ message: "مرحبًا بك في API إزالة الخلفية باستخدام Node.js!" });
});

// تشغيل السيرفر
app.listen(port, () => {
    console.log(`السيرفر يعمل على http://localhost:${port}`);
});
