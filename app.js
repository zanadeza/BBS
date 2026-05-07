// ========== تهيئة البيانات والمتغيرات ==========
let medicalDatabase = {
    terms: {},
    medications: {},
    procedures: {},
    asepsis: {}
};

let searchHistory = [];
let currentLanguage = 'ar';
let currentTheme = 'light';
let userId = localStorage.getItem('userId') || generateUserId();

function generateUserId() {
    const id = 'U' + Date.now() + Math.random().toString(36).substr(2, 6);
    localStorage.setItem('userId', id);
    return id;
}

// ========== تحميل قواعد البيانات ==========
async function loadDatabase() {
    console.log('جاري تحميل قاعدة البيانات الطبية...');
    
    // محاكاة تحميل البيانات من ملفات JSON
    // في التطبيق الفعلي، سيتم جلب الملفات من الخادم أو IndexedDB
    
    // تحميل المصطلحات التشريحية (من ملف SSS.json)
    try {
        const anatomyData = await fetch('/data/1.json').then(r => r.json()).catch(() => null);
        if (anatomyData) {
            medicalDatabase.terms = anatomyData;
        }
    } catch(e) { console.log('خطأ في تحميل ملف التشريح'); }
    
    // تحميل الأدوية (من ملفات شابتر 7-15)
    try {
        const medsData = await fetch('/data/2.json').then(r => r.json()).catch(() => null);
        if (medsData) {
            medicalDatabase.medications = medsData;
        }
    } catch(e) { console.log('خطأ في تحميل ملف الأدوية'); }
    
    // تحميل الإجراءات التمريضية
    try {
        const proceduresData = await fetch('/data/3.json').then(r => r.json()).catch(() => null);
        if (proceduresData) {
            medicalDatabase.procedures = proceduresData;
        }
    } catch(e) { console.log('خطأ في تحميل ملف الإجراءات'); }
    
    // تحميل بيانات التعقيم والسلامة
    try {
        const asepsisData = await fetch('/data/4.json').then(r => r.json()).catch(() => null);
        if (asepsisData) {
            medicalDatabase.asepsis = asepsisData;
        }
    } catch(e) { console.log('خطأ في تحميل ملف التعقيم'); }
    
    // إذا لم يتم تحميل أي بيانات، استخدم بيانات تجريبية مدمجة
    if (Object.keys(medicalDatabase.terms).length === 0 && 
        Object.keys(medicalDatabase.medications).length === 0) {
        loadMockData();
    }
    
    // تحميل سجل البحث
    loadHistory();
    
    // عرض الاقتراحات
    displaySuggestions();
}

// بيانات تجريبية مدمجة (في حالة عدم تحميل الملفات)
function loadMockData() {
    console.log('استخدام البيانات التجريبية المدمجة');
    
    medicalDatabase.terms = {
        'fever': {
            term: 'fever',
            translation: 'حمى',
            translation_en: 'Fever',
            definition: 'ارتفاع درجة حرارة الجسم عن المعدل الطبيعي (أكثر من 37.5°C) نتيجة استجابة الجسم للعدوى أو الالتهاب.',
            definition_en: 'Elevation of body temperature above normal range (above 37.5°C) as a response to infection or inflammation.',
            word_origin: 'لاتينية - febris',
            pronunciation_ar: 'حُمَّى',
            pronunciation_en: 'FEE-ver',
            examples: ['ارتفاع درجة الحرارة قد يصاحبه قشعريرة وتعرق.', 'الحمى هي آلية دفاعية طبيعية للجسم.'],
            diseases: ['الملاريا', 'الإنفلونزا', 'التهاب السحايا'],
            category: 'term',
            usage: 'يستخدم لوصف ارتفاع حرارة الجسم'
        },
        'heart': {
            term: 'heart',
            translation: 'قلب',
            translation_en: 'Heart',
            definition: 'عضو عضلي يضخ الدم في جميع أنحاء الجسم عبر الجهاز الدوري.',
            definition_en: 'Muscular organ that pumps blood throughout the body via the circulatory system.',
            word_origin: 'إنجليزية قديمة - heorte',
            pronunciation_ar: 'قَلْب',
            pronunciation_en: 'HART',
            examples: ['ينبض القلب حوالي 100,000 مرة في اليوم.', 'أمراض القلب هي أحد الأسباب الرئيسية للوفاة.'],
            diseases: ['قصور القلب', 'نوبة قلبية', 'اعتلال عضلة القلب'],
            category: 'term'
        },
        'penicillin': {
            term: 'penicillin',
            translation: 'بنسلين',
            translation_en: 'Penicillin',
            definition: 'مجموعة من المضادات الحيوية المشتقة من فطر البنسليوم، تستخدم لعلاج الالتهابات البكتيرية.',
            definition_en: 'Group of antibiotics derived from Penicillium fungi, used to treat bacterial infections.',
            word_origin: 'لاتينية - penicillium (فرشاة صغيرة)',
            pronunciation_ar: 'بِنْسِلِين',
            pronunciation_en: 'pen-i-SIL-in',
            examples: ['يستخدم البنسلين لعلاج التهاب الحلق العقدي.', 'قد يسبب البنسلين ردود فعل تحسسية لدى بعض الأشخاص.'],
            diseases: ['التهاب رئوي', 'التهاب السحايا', 'الزهري'],
            category: 'medication',
            dosage: '250-500 ملغ كل 6-8 ساعات',
            side_effects: ['إسهال', 'طفح جلدي', 'حساسية'],
            mechanism: 'يمنع بناء جدار الخلية البكتيرية'
        },
        'infection': {
            term: 'infection',
            translation: 'عدوى',
            translation_en: 'Infection',
            definition: 'غزو أنسجة الجسم بواسطة ميكروبات ممرضة، تتكاثر وتسبب استجابة مناعية.',
            definition_en: 'Invasion of body tissues by pathogenic microorganisms that multiply and cause an immune response.',
            pronunciation_ar: 'عَدْوَى',
            pronunciation_en: 'in-FEK-shun',
            examples: ['غسل اليدين يمنع انتشار العدوى.', 'العدوى قد تكون بكتيرية أو فيروسية أو فطرية.'],
            diseases: ['الإنتان', 'العدوى الجراحية', 'عدوى المسالك البولية'],
            category: 'term'
        }
    };
    
    medicalDatabase.medications = {
        'penicillin': medicalDatabase.terms.penicillin,
        'amoxicillin': {
            term: 'amoxicillin',
            translation: 'أموكسيسيلين',
            translation_en: 'Amoxicillin',
            definition: 'مضاد حيوي من مجموعة البنسلين واسع المدى.',
            category: 'medication',
            dosage: '250-500 ملغ كل 8 ساعات',
            side_effects: ['غثيان', 'إسهال', 'طفح جلدي']
        }
    };
}

// تحميل سجل البحث من LocalStorage
function loadHistory() {
    const saved = localStorage.getItem(`MedTerm_history_${userId}`);
    if (saved) {
        searchHistory = JSON.parse(saved);
    } else {
        searchHistory = [];
    }
}

// حفظ سجل البحث
function saveHistory() {
    localStorage.setItem(`MedTerm_history_${userId}`, JSON.stringify(searchHistory.slice(0, 50)));
}

// إضافة مصطلح إلى سجل البحث
function addToHistory(term) {
    const existing = searchHistory.find(item => item.term.toLowerCase() === term.toLowerCase());
    if (existing) {
        existing.timestamp = Date.now();
    } else {
        searchHistory.unshift({ term, timestamp: Date.now() });
    }
    // الاحتفاظ بآخر 50 مصطلح فقط
    if (searchHistory.length > 50) searchHistory.pop();
    saveHistory();
}

// ========== وظائف البحث ==========
function search(query) {
    if (!query || query.trim() === '') {
        clearResults();
        return;
    }
    
    query = query.trim().toLowerCase();
    addToHistory(query);
    
    let results = [];
    
    // البحث في المصطلحات
    for (let [key, value] of Object.entries(medicalDatabase.terms)) {
        if (key.toLowerCase().includes(query) || 
            value.translation?.toLowerCase().includes(query) ||
            value.definition?.toLowerCase().includes(query)) {
            results.push({ ...value, term: key, category: 'term' });
        }
    }
    
    // البحث في الأدوية
    for (let [key, value] of Object.entries(medicalDatabase.medications)) {
        if (key.toLowerCase().includes(query) || 
            value.translation?.toLowerCase().includes(query)) {
            results.push({ ...value, term: key, category: 'medication' });
        }
    }
    
    // البحث في الإجراءات
    for (let [key, value] of Object.entries(medicalDatabase.procedures)) {
        if (key.toLowerCase().includes(query)) {
            results.push({ ...value, term: key, category: 'procedure' });
        }
    }
    
    if (results.length > 0) {
        displayResults(results[0]); // عرض أفضل نتيجة
    } else {
        displayNoResults(query);
    }
}

// عرض النتائج المفصلة
function displayResults(result) {
    const welcomeDiv = document.querySelector('.welcome-message');
    const suggestionsDiv = document.querySelector('.suggestions-section');
    const noResultsDiv = document.getElementById('no-results');
    const resultDetail = document.getElementById('result-detail');
    
    welcomeDiv.style.display = 'none';
    suggestionsDiv.style.display = 'none';
    noResultsDiv.style.display = 'none';
    resultDetail.style.display = 'block';
    
    const translationText = currentLanguage === 'ar' ? result.translation : result.translation_en || result.translation;
    const definitionText = currentLanguage === 'ar' ? result.definition : result.definition_en || result.definition;
    const pronunciation = currentLanguage === 'ar' ? result.pronunciation_ar : result.pronunciation_en;
    
    let categoryBadge = '';
    let categoryText = '';
    switch(result.category) {
        case 'term': categoryText = currentLanguage === 'ar' ? 'مصطلح طبي' : 'Medical Term'; break;
        case 'medication': categoryText = currentLanguage === 'ar' ? 'دواء' : 'Medication'; break;
        case 'procedure': categoryText = currentLanguage === 'ar' ? 'إجراء طبي' : 'Medical Procedure'; break;
        default: categoryText = 'Medical';
    }
    
    let additionalContent = '';
    if (result.category === 'medication') {
        additionalContent = `
            <div class="definition-card">
                <h4><i class="fas fa-pills"></i> ${currentLanguage === 'ar' ? 'الجرعة' : 'Dosage'}</h4>
                <p>${result.dosage || (currentLanguage === 'ar' ? 'حسب وصفة الطبيب' : 'As prescribed')}</p>
            </div>
            <div class="definition-card">
                <h4><i class="fas fa-exclamation-triangle"></i> ${currentLanguage === 'ar' ? 'الآثار الجانبية' : 'Side Effects'}</h4>
                <ul class="examples-list">
                    ${(result.side_effects || ['غثيان', 'إسهال']).map(e => `<li>${e}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    if (result.word_origin) {
        additionalContent += `
            <div class="definition-card">
                <h4><i class="fas fa-language"></i> ${currentLanguage === 'ar' ? 'أصل الكلمة' : 'Word Origin'}</h4>
                <p>${result.word_origin}</p>
            </div>
        `;
    }
    
    resultDetail.innerHTML = `
        <div class="result-header">
            <div class="result-term">${result.term}</div>
            <div class="result-pronunciation">
                <span>${pronunciation || ''}</span>
                <button class="pronounce-btn" data-text="${result.term}">
                    <i class="fas fa-volume-up"></i> ${currentLanguage === 'ar' ? 'نطق' : 'Pronounce'}
                </button>
            </div>
            <div class="result-meta">
                <span class="badge">${categoryText}</span>
            </div>
        </div>
        <div class="result-content">
            <div class="translation-card">
                <h4><i class="fas fa-language"></i> ${currentLanguage === 'ar' ? 'الترجمة' : 'Translation'}</h4>
                <div class="translation-text">${translationText || result.translation}</div>
            </div>
            <div class="definition-card">
                <h4><i class="fas fa-info-circle"></i> ${currentLanguage === 'ar' ? 'الشرح' : 'Definition'}</h4>
                <div class="definition-text">${definitionText || (currentLanguage === 'ar' ? 'لا يوجد شرح متاح' : 'No definition available')}</div>
            </div>
            ${additionalContent}
            ${result.examples ? `
            <div class="examples-card">
                <h4><i class="fas fa-stethoscope"></i> ${currentLanguage === 'ar' ? 'أمثلة طبية' : 'Medical Examples'}</h4>
                <ul class="examples-list">
                    ${result.examples.map(ex => `<li>${ex}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            ${result.diseases ? `
            <div class="diseases-card">
                <h4><i class="fas fa-virus"></i> ${currentLanguage === 'ar' ? 'الأمراض المرتبطة' : 'Associated Diseases'}</h4>
                <ul class="diseases-list">
                    ${result.diseases.map(d => `<li>${d}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </div>
    `;
    
    // إضافة حدث النطق
    const pronounceBtn = resultDetail.querySelector('.pronounce-btn');
    if (pronounceBtn) {
        pronounceBtn.addEventListener('click', () => {
            speak(result.term);
        });
    }
    
    // تمرير إلى أعلى النتيجة
    resultDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// وظيفة النطق الصوتي
function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }
}

// عرض عدم وجود نتائج
function displayNoResults(query) {
    const welcomeDiv = document.querySelector('.welcome-message');
    const suggestionsDiv = document.querySelector('.suggestions-section');
    const noResultsDiv = document.getElementById('no-results');
    const resultDetail = document.getElementById('result-detail');
    
    welcomeDiv.style.display = 'none';
    suggestionsDiv.style.display = 'none';
    resultDetail.style.display = 'none';
    noResultsDiv.style.display = 'block';
    document.getElementById('search-term').innerText = query;
}

// مسح النتائج والعودة للواجهة الرئيسية
function clearResults() {
    const welcomeDiv = document.querySelector('.welcome-message');
    const suggestionsDiv = document.querySelector('.suggestions-section');
    const noResultsDiv = document.getElementById('no-results');
    const resultDetail = document.getElementById('result-detail');
    
    welcomeDiv.style.display = 'block';
    suggestionsDiv.style.display = 'block';
    noResultsDiv.style.display = 'none';
    resultDetail.style.display = 'none';
}

// عرض الاقتراحات
function displaySuggestions() {
    const suggestions = ['fever', 'heart', 'penicillin', 'infection', 'pneumonia', 'diabetes'];
    const grid = document.getElementById('suggestions-grid');
    if (grid) {
        grid.innerHTML = suggestions.map(term => 
            `<div class="suggestion-item" data-term="${term}">${term}</div>`
        ).join('');
        
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                document.getElementById('search-input').value = item.dataset.term;
                search(item.dataset.term);
            });
        });
    }
}

// ========== وظائف الواجهة والثيم ==========
function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('MedTerm_theme', theme);
    
    // تحديث أيقونة الثيم
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('MedTerm_lang', lang);
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // تحديث الأزرار
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // تحديث placeholder
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.placeholder = lang === 'ar' ? 'ابحث عن مصطلح طبي، دواء، أو جملة...' : 'Search for medical term, drug, or phrase...';
    }
}

// ========== التهيئة وتسجيل الأحداث ==========
document.addEventListener('DOMContentLoaded', async () => {
    // تحميل الثيم المحفوظ
    const savedTheme = localStorage.getItem('MedTerm_theme');
    if (savedTheme) setTheme(savedTheme);
    
    // تحميل اللغة المحفوظة
    const savedLang = localStorage.getItem('MedTerm_lang');
    if (savedLang) setLanguage(savedLang);
    
    // تحميل قاعدة البيانات
    await loadDatabase();
    
    // البحث الفوري
    const searchInput = document.getElementById('search-input');
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            search(e.target.value);
        }, 300);
    });
    
    // زر مسح البحث
    document.getElementById('clear-search')?.addEventListener('click', () => {
        searchInput.value = '';
        clearResults();
    });
    
    // البحث الصوتي
    const voiceBtn = document.getElementById('voice-search-btn');
    if (voiceBtn && 'webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
        recognition.continuous = false;
        
        voiceBtn.addEventListener('click', () => {
            recognition.start();
            voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        });
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript;
            search(transcript);
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        };
        
        recognition.onend = () => {
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        };
    }
    
    // القائمة الجانبية
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('close-sidebar');
    
    menuBtn?.addEventListener('click', () => {
        sidebar.classList.add('open');
    });
    
    closeSidebar?.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });
    
    // إغلاق القائمة بالضغط خارجها
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') && 
            !sidebar.contains(e.target) && 
            !menuBtn.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
    
    // تبديل الثيم
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });
    
    // تبديل اللغة
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
            // إعادة البحث إذا كان هناك نص
            if (searchInput.value) {
                search(searchInput.value);
            }
        });
    });
    
    // الأزرار السريعة
    document.querySelectorAll('.quick-card').forEach(card => {
        card.addEventListener('click', () => {
            const suggestion = card.dataset.suggestion;
            if (suggestion) {
                searchInput.value = suggestion;
                search(suggestion);
            }
        });
    });
    
    // إعدادات Onboarding
    const onboardingDiv = document.getElementById('onboarding');
    if (onboardingDiv && !localStorage.getItem('MedTerm_onboarding_completed')) {
        let currentSlide = 0;
        const slides = document.querySelectorAll('.onboarding-slide');
        const dots = document.querySelectorAll('.dot');
        
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }
        
        document.getElementById('next-onboarding')?.addEventListener('click', () => {
            if (currentSlide < slides.length - 1) {
                currentSlide++;
                showSlide(currentSlide);
            } else {
                onboardingDiv.style.display = 'none';
                localStorage.setItem('MedTerm_onboarding_completed', 'true');
            }
        });
        
        document.getElementById('skip-onboarding')?.addEventListener('click', () => {
            onboardingDiv.style.display = 'none';
            localStorage.setItem('MedTerm_onboarding_completed', 'true');
        });
    } else if (onboardingDiv) {
        onboardingDiv.style.display = 'none';
    }
    
    // عرض سجل البحث في القائمة
    const historyMenuItem = document.querySelector('.sidebar-menu li:first-child + li');
    if (historyMenuItem) {
        historyMenuItem.addEventListener('click', () => {
            const historyList = searchHistory.map(item => item.term).slice(0, 10);
            if (historyList.length > 0) {
                const suggestionsGrid = document.getElementById('suggestions-grid');
                if (suggestionsGrid) {
                    suggestionsGrid.innerHTML = historyList.map(term => 
                        `<div class="suggestion-item" data-term="${term}">${term}</div>`
                    ).join('');
                    document.querySelectorAll('.suggestion-item').forEach(item => {
                        item.addEventListener('click', () => {
                            searchInput.value = item.dataset.term;
                            search(item.dataset.term);
                        });
                    });
                }
            }
            sidebar.classList.remove('open');
        });
    }
});
