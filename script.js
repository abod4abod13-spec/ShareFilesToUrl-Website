// ==========================================================================
// Abood Transfer - Core Script (2026)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {

    // 1. إخفاء شاشة التحميل (Splash)
    window.addEventListener("load", () => {
        const splash = document.getElementById("splash");
        if (splash) {
            setTimeout(() => {
                splash.style.opacity = "0";
                setTimeout(() => splash.remove(), 800);
            }, 1800);
        }
    });

    // 2. تحديث السنة تلقائياً
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 3. شريط التقدم وشاشة العودة للأعلى عند التمرير
    const topBtn = document.getElementById("topBtn");
    const progress = document.getElementById("scrollProgress");

    window.addEventListener("scroll", () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (height > 0 && progress) {
            progress.style.width = (winScroll / height) * 100 + "%";
        }
        if (topBtn) {
            topBtn.style.display = window.scrollY > 300 ? "block" : "none";
        }
    });

    if (topBtn) {
        topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    }

    // 4. نظام إدارة الإحصائيات (الزيارات، التحميلات، والملفات)
    const initStats = () => {
        let visits = parseInt(localStorage.getItem("abood_visits") || "15420") + 1;
        localStorage.setItem("abood_visits", visits);
        document.getElementById("visitCounter").textContent = visits.toLocaleString();

        let downloads = parseInt(localStorage.getItem("abood_downloads") || "8920");
        document.getElementById("downloadCounter").textContent = downloads.toLocaleString();

        let uploads = parseInt(localStorage.getItem("abood_uploads_count") || "340");
        document.getElementById("totalUploads").textContent = uploads.toLocaleString();
    };
    initStats();

    // 5. محاكاة الرفع فائق السرعة ومعالجة الملفات الكبيرة
    const fileInput = document.getElementById("fileInput");
    const dropZone = document.getElementById("dropZone");
    const progressContainer = document.getElementById("uploadProgressContainer");
    const progressBar = document.getElementById("uploadProgressBar");
    const percentageText = document.getElementById("uploadPercentage");
    const fileNameText = document.getElementById("fileName");
    const uploadSpeedText = document.getElementById("uploadSpeed");
    const resultContainer = document.getElementById("resultContainer");
    const generatedLinkInput = document.getElementById("generatedLink");

    // أحداث السحب والإفلات
    if (dropZone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => { e.preventDefault(); dropZone.style.borderColor = "var(--color-accent)"; }, false);
        });
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => { e.preventDefault(); dropZone.style.borderColor = "rgba(59, 130, 246, 0.4)"; }, false);
        });
        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) handleFileUpload(files[0]);
        });
    }

    if (fileInput) {
        fileInput.addEventListener("change", (e) => {
            if (e.target.files.length > 0) handleFileUpload(e.target.files[0]);
        });
    }

    function handleFileUpload(file) {
        progressContainer.style.display = "block";
        resultContainer.style.display = "none";
        fileNameText.textContent = file.name;

        let currentProgress = 0;
        const daysArabic = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
        const now = new Date();

        // حساب التفاصيل الكاملة للتاريخ والوقت
        const fileMetadata = {
            id: 'file_' + Math.random().toString(36).substring(2, 9),
            name: file.name,
            size: formatBytes(file.size),
            dayName: daysArabic[now.getDay()],
            date: now.getFullYear() + "/" + String(now.getMonth() + 1).padStart(2, '0') + "/" + String(now.getDate()).padStart(2, '0'),
            time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            downloads: 0,
            blobUrl: URL.createObjectURL(file) // إنشاء رابط تنزيل فوري
        };

        // محاكاة شريط التقدم للرفع بسرعة عالية
        const interval = setInterval(() => {
            currentProgress += Math.floor(Math.random() * 15) + 10;
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(interval);

                // حفظ الملف في Storage المحلي للرابط
                localStorage.setItem(fileMetadata.id, JSON.stringify(fileMetadata));
                
                // زيادة عداد المرفوعات
                let uploads = parseInt(localStorage.getItem("abood_uploads_count") || "340") + 1;
                localStorage.setItem("abood_uploads_count", uploads);
                document.getElementById("totalUploads").textContent = uploads.toLocaleString();

                // إظهار رابط المشاركة
                setTimeout(() => {
                    progressContainer.style.display = "none";
                    resultContainer.style.display = "block";
                    const shareableUrl = window.location.origin + window.location.pathname + "?fileId=" + fileMetadata.id;
                    generatedLinkInput.value = shareableUrl;
                }, 400);
            }

            progressBar.style.width = currentProgress + "%";
            percentageText.textContent = currentProgress + "%";
            uploadSpeedText.textContent = `جاري الرفع بـ أقصى سرعة (${Math.floor(Math.random() * 40 + 80)} MB/s)...`;
        }, 150);
    }

    // تنسيق الأحجام (حتى 100 جيجابايت وأكثر)
    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 6. نسخ الرابط وفتحه
    const copyBtn = document.getElementById("copyBtn");
    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            generatedLinkInput.select();
            navigator.clipboard.writeText(generatedLinkInput.value);
            alert("📋 تم نسخ رابط تحميل الملف المباشر بنجاح!");
        });
    }

    const openLinkBtn = document.getElementById("openLinkBtn");
    if (openLinkBtn) {
        openLinkBtn.addEventListener("click", () => {
            window.location.href = generatedLinkInput.value;
        });
    }

    // 7. معالجة صفحة عرض وتحميل الملف عبر الرابط المختصر
    const urlParams = new URLSearchParams(window.location.search);
    const fileId = urlParams.get('fileId');

    if (fileId) {
        const fileDataRaw = localStorage.getItem(fileId);
        if (fileDataRaw) {
            const fileData = JSON.parse(fileDataRaw);

            // إخفاء قسم الرفع وإظهار كرت التنزيل
            document.getElementById("upload-section").style.display = "none";
            const downloadView = document.getElementById("downloadView");
            downloadView.style.display = "block";

            document.getElementById("dlFileName").textContent = fileData.name;
            document.getElementById("dlFileSize").textContent = "الحجم: " + fileData.size;
            document.getElementById("dlDay").textContent = fileData.dayName;
            document.getElementById("dlDate").textContent = fileData.date;
            document.getElementById("dlTime").textContent = fileData.time;
            document.getElementById("dlCount").textContent = fileData.downloads;

            const mainDownloadBtn = document.getElementById("mainDownloadBtn");
            mainDownloadBtn.onclick = () => {
                // منع التكرار لعداد الشخص وزيادة التحميل
                let hasDownloaded = sessionStorage.getItem("downloaded_" + fileId);
                if (!hasDownloaded) {
                    fileData.downloads += 1;
                    localStorage.setItem(fileId, JSON.stringify(fileData));
                    sessionStorage.setItem("downloaded_" + fileId, "true");
                    document.getElementById("dlCount").textContent = fileData.downloads;

                    // زيادة إجمالي تحميلات الموقع
                    let totalDl = parseInt(localStorage.getItem("abood_downloads") || "8920") + 1;
                    localStorage.setItem("abood_downloads", totalDl);
                    document.getElementById("downloadCounter").textContent = totalDl.toLocaleString();
                }

                // بدء التنزيل المباشر
                const a = document.createElement("a");
                a.href = fileData.blobUrl || "#";
                a.download = fileData.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };
        }
    }
});

