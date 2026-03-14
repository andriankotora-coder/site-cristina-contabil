const express = require('express');
const mongoose = require('mongoose'); // 1. IMPORTĂ MONGOOSE
const helmet = require('helmet');
const compression = require('compression');
const nodemailer = require('nodemailer');
const path = require('path');
const Settings = require('./src/models/Settings');
require('dotenv').config();
const PORT = process.env.PORT || 3000;

// IMPORTĂ MODELUL (Asigură-te că ai creat fișierul src/models/Lead.js)
const Lead = require('./src/models/Lead'); 

const app = express();

// --- CONECTARE BAZĂ DE DATE ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectat la MongoDB Enterprise'))
    .catch(err => console.error('❌ Eroare conexiune DB:', err));

    // Funcție pentru verificarea accesului
const adminAuth = (req, res, next) => {
    // Putem folosi un Query Parameter pentru simplitate acum: ?pass=...
    const { pass } = req.query;
    
    if (pass === process.env.ADMIN_PASSWORD) {
        next(); // Parola e corectă, mergi mai departe
    } else {
        res.status(403).send("<h1>Acces Respins</h1><p>Nu aveți permisiunea de a vedea această pagină.</p>");
    }
};

// --- MIDDLEWARES ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// --- RUTE ---

// 1. Pagina principală
app.get('/', async (req, res) => {
    const settingsArr = await Settings.find();
    // Transformăm array-ul într-un obiect ușor de folosit: { hero_title: "...", ... }
    const settings = {};
    settingsArr.forEach(s => settings[s.key] = s.value);
    
    res.render('index', { 
        title: 'Cristina Baiura',
        settings: settings // Trimitem textele către site
    });
});

app.post('/admin/update-settings', adminAuth, async (req, res) => {
    try {
        const { key, value } = req.body;
        await Settings.findOneAndUpdate({ key }, { value }, { upsert: true });
        res.redirect(`/admin-dashboard-cristina?pass=${process.env.ADMIN_PASSWORD}`);
    } catch (error) {
        res.status(500).send("Eroare la salvarea setărilor.");
    }
});

// 2. Ruta de Contact (AICI BAGI CODUL NOU)
app.post('/contact', async (req, res) => {
    try {
        const { nume, email, serviciu, mesaj } = req.body;

        // 1. Salvare în DB (Dacă asta eșuează, verifică modelul Lead)
        const nouLead = new Lead({ nume, email, serviciu, mesaj });
        await nouLead.save();

        // 2. Trimite Email (Dacă asta eșuează, verifică setările Gmail)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS // AICI TREBUIE APP PASSWORD, NU PAROLA CONTULUI
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Trimite-ți ție notificarea
            subject: `Lead Nou: ${nume}`,
            text: `Mesaj de la ${nume} (${email}) pentru ${serviciu}: ${mesaj}`
        };

        // Opțional: Poți folosi await doar dacă ești sigur că mail-ul merge
        // Sau poți să nu aștepți mail-ul ca să răspunzi rapid clientului
        transporter.sendMail(mailOptions).catch(err => console.log("Eroare trimitere mail (dar lead-ul s-a salvat):", err));

        // Trimitem răspuns de succes
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('❌ EROARE CRITICĂ SERVER:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
// 3. Ruta pentru Panoul de Administrare (Dashboard)
app.get('/admin-dashboard-cristina', adminAuth, async (req, res) => {
    try {
        // Extragem toate mesajele din baza de date, cele mai noi primele
        const leaduri = await Lead.find().sort({ data: -1 });
        
        // Randăm pagina admin.ejs și trimitem datele către ea
        res.render('admin', { 
            title: 'Panou Administrare | Mesaje Clienți',
            leaduri 
        });
    } catch (error) {
        console.error('❌ Eroare la încărcarea dashboard-ului:', error);
        res.status(500).send("Eroare la încărcarea datelor.");
    }
});

// 4. Ruta pentru ștergerea unui mesaj
app.post('/admin/delete/:id', adminAuth, async (req, res) => {
    try {
        await Lead.findByIdAndDelete(req.params.id);
        // Trimitem parola înapoi în URL pentru a rămâne logați
        res.redirect(`/admin-dashboard-cristina?pass=${process.env.ADMIN_PASSWORD}`);
    } catch (error) {
        res.status(500).send("Nu s-a putut șterge mesajul.");
    }
});
app.listen(PORT, () => console.log(`🚀 Server pe portul ${PORT}`));