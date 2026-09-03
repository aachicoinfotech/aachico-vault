/**
 * Aachico Vault - Complete Authentication, RBAC & Multi-Device Lock Engine
 * Path: js/auth.js
 */

(function () {
    'use strict';

    const ROLES = {
        SUPERADMIN: 'superadmin',
        ADMIN: 'admin',
        MANAGER: 'manager',
        DRIVER: 'driver'
    };

    window.AachicoAuth = {
        getCurrentUser: function () {
            const sessionData = sessionStorage.getItem('aachico_user_session');
            return sessionData ? JSON.parse(sessionData) : null;
        },

        // 1. लॉगिन और मल्टी-डिवाइस टोकन बाइंडिंग
        loginUser: async function (userData) {
            // userData format: { uid, email, role, companyId }
            const sessionToken = 'tok_' + Math.random().toString(36).substring(2) + Date.now();
            
            userData.token = sessionToken;
            sessionStorage.setItem('aachico_user_session', JSON.stringify(userData));
            sessionStorage.setItem('aachico_session_token', sessionToken);

            try {
                // फायरबेस डेटाबेस में नया एक्टिव सेशन टोकन सेव करें (मल्टी-डिवाइस लॉक)
                if (window.db) {
                    await window.db.collection('users').doc(userData.uid).set({
                        activeSessionToken: sessionToken,
                        lastLogin: new Date().toISOString()
                    }, { merge: true });
                }
            } catch (error) {
                console.error("Session token sync failed:", error);
            }

            this.redirectByRole(userData.role);
        },

        redirectByRole: function (role) {
            const basePath = window.location.pathname.startsWith('/aachico-vault/') ? '/aachico-vault' : '';
            
            switch (role) {
                case ROLES.SUPERADMIN:
                    window.location.href = basePath + '/portal/sys-config-v2/';
                    break;
                case ROLES.ADMIN:
                    window.location.href = basePath + '/admin.html';
                    break;
                case ROLES.MANAGER:
                    window.location.href = basePath + '/manager.html';
                    break;
                case ROLES.DRIVER:
                    window.location.href = basePath + '/driver.html';
                    break;
                default:
                    window.location.href = basePath + '/login.html';
            }
        },

        // 2. लाइव सेशन वॉचर (किक-आउट लॉजिक: यदि दूसरे डिवाइस पर लॉगिन हुआ हो)
        initSessionWatcher: function () {
            const user = this.getCurrentUser();
            if (!user || !window.db) return;

            // हर 10 सेकंड में फायरबेस से टोकन वैलिडेट करना
            setInterval(async () => {
                try {
                    const docSnapshot = await window.db.collection('users').doc(user.uid).get();
                    if (docSnapshot.exists) {
                        const serverToken = docSnapshot.data().activeSessionToken;
                        const localToken = sessionStorage.getItem('aachico_session_token');

                        if (serverToken && localToken && serverToken !== localToken) {
                            alert("यह अकाउंट किसी अन्य डिवाइस पर लॉगिन हो चुका है। सुरक्षा कारणों से आपको लॉगआउट किया जा रहा है।");
                            this.logout();
                        }
                    }
                } catch (err) {
                    console.error("Session Watcher Error:", err);
                }
            }, 10000);
        },

        // 3. रोल-आधारित पेज प्रोटेक्शन (RBAC)
        protectPage: function (allowedRoles) {
            const user = this.getCurrentUser();
            const basePath = window.location.pathname.startsWith('/aachico-vault/') ? '/aachico-vault' : '';

            if (!user || !allowedRoles.includes(user.role)) {
                console.warn("Unauthorized access. Redirecting to login...");
                window.location.href = basePath + '/login.html';
                return;
            }

            // पेज सही होने पर मल्टी-डिवाइस वॉचर शुरू कर दें
            this.initSessionWatcher();
        },

        logout: function () {
            sessionStorage.clear();
            const basePath = window.location.pathname.startsWith('/aachico-vault/') ? '/aachico-vault' : '';
            window.location.href = basePath + '/login.html';
        }
    };

    // 4. इनएक्टिविटी ऑटो-लॉगआउट (15 मिनट)
    let inactivityTimer;
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            if (window.AachicoAuth.getCurrentUser()) {
                alert("इनएक्टिविटी के कारण आपका सत्र (Session) समाप्त हो गया है।");
                window.AachicoAuth.logout();
            }
        }, 900000); // 15 minutes
    }

    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keypress', resetInactivityTimer);

})();
