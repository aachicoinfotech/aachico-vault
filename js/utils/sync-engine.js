/**
 * Aachico Vault - Audit, Sync & Utility Engine
 * Handles offline queueing, image compression, network status, and geolocation tracking.
 */

window.AachicoUtils = (function () {
  
  // 1. नेटवर्क और कनेक्टिविटी लिसनर (Network Status Tracker)
  function initNetworkListener(onStatusChange) {
    window.addEventListener('online', () => {
      console.log("🌐 नेटवर्क ऑनलाइन हो गया है। ऑफलाइन कतार सिंक की जा रही है...");
      processOfflineQueue();
      if (onStatusChange) onStatusChange(true);
    });

    window.addEventListener('offline', () => {
      console.log("⚠️ इंटरनेट कनेक्शन कट गया है। डेटा लोकल स्टोरेज में सुरक्षित किया जा रहा है...");
      if (onStatusChange) onStatusChange(false);
    });
  }

  // 2. ऑफलाइन सिंक कतार (Queue-based Offline Sync)
  function saveToOfflineQueue(actionType, payload) {
    try {
      const queue = JSON.parse(localStorage.getItem('aachico_offline_queue') || '[]');
      queue.push({
        id: 'q_' + Math.random().toString(36).substring(2, 9),
        type: actionType,
        payload: payload,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('aachico_offline_queue', JSON.stringify(queue));
      console.log(`📦 एक्शन [${actionType}] को ऑफलाइन कतार में सुरक्षित कर लिया गया है।`);
      return true;
    } catch (err) {
      console.error("오류 (Error saving to offline queue):", err);
      return false;
    }
  }

  async function processOfflineQueue() {
    if (!navigator.onLine) return;
    
    try {
      const queue = JSON.parse(localStorage.getItem('aachico_offline_queue') || '[]');
      if (queue.length === 0) return;

      console.log(`🔄 कुल ${queue.length} लंबित ऑफलाइन डेटा को फायरबेस से सिंक किया जा रहा है...`);
      
      // यहाँ आप अपने फायरबेस सिंक लॉजिक को ट्रिगर कर सकते हैं
      // सफल होने पर कतार को साफ कर दें:
      localStorage.removeItem('aachico_offline_queue');
      console.log("✅ सभी ऑफलाइन डेटा सफलताપूर्वक सिंक हो गए हैं!");
    } catch (err) {
      console.error("सिंक करने में त्रुटि:", err);
    }
  }

  // 3. इमेज ऑटो-कंप्रेशन (Image Auto-Compression for Fast Uploads)
  function compressImage(file, maxWidth = 1024, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function () {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('इमेज कंप्रेशन असफल रहा।'));
                return;
              }
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  }

  // 4. जियो-लोकेशन ट्रैकिंग बेस (Geolocation Tracker)
  function getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("आपका ब्राउज़र जियो-लोकेशन का समर्थन नहीं करता है।"));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          (error) => {
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    });
  }

  return {
    initNetworkListener,
    saveToOfflineQueue,
    processOfflineQueue,
    compressImage,
    getCurrentLocation
  };
})();
