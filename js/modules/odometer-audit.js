/**
 * Aachico Vault - Anti-Cheating Odometer & Photo Audit Unified Engine
 */

window.OdometerAuditEngine = (function() {

  // 1. ओडोमीटर KM वैलिडेशन (Start vs End)
  function validateOdometer(startKm, endKm) {
    if (Number(endKm) <= Number(startKm)) {
      throw new Error("त्रुटि: एंड किलोमीटर हमेशा स्टार्ट किलोमीटर से ज्यादा होना चाहिए!");
    }
    return true;
  }

  // 2. फोटो मेटाडेटा चेकिंग (टैम्पर-प्रूफ टाइमस्टैम्प)
  function verifyPhotoMetadata(file) {
    const fileTime = file.lastModified;
    const currentTime = new Date().getTime();
    const diffMinutes = (currentTime - fileTime) / 60000;

    // यदि फाइल की टाइमिंग 2 मिनट से पुरानी है
    if (diffMinutes > 2) {
      throw new Error("सुरक्षा चेतावनी: यह फोटो लाइव कैमरे से नहीं ली गई है या पुरानी है!");
    }
    return true;
  }

  // 3. क्लाइंट-साइड ऑटो-कंप्रेशन (50-80 KB)
  async function processPhoto(file) {
    const compressedFile = await window.AachicoUtils.compressImage(file, 800, 0.6);
    return compressedFile;
  }

  // 4. ऑटोमैटिक GPS जियो-टैगिंग
  async function captureGeoLocation() {
    try {
      const position = await window.AachicoUtils.getCurrentLocation();
      return {
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy
      };
    } catch (error) {
      throw new Error("GPS लोकेशन प्राप्त करने में असफल। कृपया जीपीएस ऑन रखें।");
    }
  }

  // 5. नाइट बूस्ट चेक (UI के लिए)
  function checkNightBoost() {
    const currentHour = new Date().getHours();
    return currentHour >= 19 || currentHour <= 6;
  }

  // --- मास्टर एग्जीक्यूशन फंक्शन (सभी 6 फीचर्स का एक साथ बंडल) ---
  async function executeFullAudit(startKm, endKm, fileInputId) {
    try {
      const fileInput = document.getElementById(fileInputId);
      if (!fileInput || fileInput.files.length === 0) {
        throw new Error("कृपया मीटर की लाइव फोटो कैप्चर करें।");
      }
      const photoFile = fileInput.files[0];

      // स्टेप 1 & 2: ओडोमीटर और मेटाडेटा की तुरंत जांच
      validateOdometer(startKm, endKm);
      verifyPhotoMetadata(photoFile);

      // स्टेप 3 & 4: एक साथ इमेज कंप्रेशन और GPS कैप्चर करना
      console.log("🔄 फोटो कंप्रेस हो रही है और GPS लोकेशन ट्रैक की जा रही है...");
      const [compressedImg, gpsData] = await Promise.all([
        processPhoto(photoFile),
        captureGeoLocation()
      ]);

      const auditPayload = {
        startKm: Number(startKm),
        endKm: Number(endKm),
        gps: gpsData,
        imageSizeKb: Math.round(compressedImg.size / 1024),
        timestamp: new Date().toISOString(),
        nightBoostActive: checkNightBoost()
      };

      // स्टेप 5: ऑफलाइन कतार या फायरबेस में सुरक्षित भेजना
      window.AachicoUtils.saveToOfflineQueue('ODOMETER_MASTER_AUDIT', auditPayload);

      return { 
        success: true, 
        message: "एंटी-चीटिंग ऑडिट पूरी तरह सफल! डेटा सुरक्षित कर लिया गया है।", 
        data: auditPayload 
      };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  return {
    executeFullAudit,
    checkNightBoost
  };

})();
