const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// --- Middlewares de Nivel Înalt ---
app.use(helmet({
    contentSecurityPolicy: false, // Permite Tailwind/Google Fonts
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setări Engine de Vizualizare
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static(path.join(__dirname, 'public')));

// --- Rute ---
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Cristina Baiura | Expert Contabil & Consultanță Fiscală',
        page: 'home' 
    });
});



    // 2. Definire conținut email
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'cristina.baiura@exemplu.com', // Pune aici emailul real al Cristinei
        subject: `Lead Nou Landing Page: ${nume}`,
        html: `
            <div style="font-family: sans-serif; color: #333;">
                <h2>Solicitare Nouă de Servicii - Cristina Baiura</h2>
                <p><strong>Nume:</strong> ${nume}</p>
                <p><strong>Email Client:</strong> ${email}</p>
                <p><strong>Serviciu Interes:</strong> ${serviciu}</p>
                <hr>
                <p><strong>Mesaj:</strong></p>
                <p>${mesaj}</p>
            </div>
        `
    };

    // 3. Trimitere email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email trimis cu succes către Cristina pentru: ${nume}`);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('❌ Eroare la trimiterea emailului:', error);
        res.status(500).json({ success: false, error: 'Nu s-a putut trimite mesajul.' });
    }
