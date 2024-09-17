const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const { mail } = require('../keys');

const helpers = {};

helpers.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10); // genera un hash, 10 la cantidad de veces que se va a encriptar
    return await bcrypt.hash(password, salt); // encripta la contraseña basado en el hash y el salt
};

helpers.matchPassword = async (password, savedPassword) => {
    try {
        return await bcrypt.compare(password, savedPassword); // compara la contraseña ingresada con la contraseña encriptada
    } catch (e) {
        console.log(e);
    }
};

helpers.sendConfirmationEmail = async (email, subject, message) => {
    
        const mailOptions = {
          from: 'defensa.civil.tandil@gmail.com',           // Dirección de correo del remitente
          to: email,                      // Correo del usuario habilitado
          subject: 'Cuenta Habilitada',
          text: '¡Tu cuenta ha sido habilitada por el administrador! Ya puedes acceder al sistema.'
          // Puedes también enviar HTML si prefieres:
          // html: '<p>¡Tu cuenta ha sido habilitada por el administrador!</p>'
        };
      
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error al enviar correo:', error);
          } else {
            console.log('Correo enviado:', info.response);
          }
        });
      
      
};

// Configurar el servicio de correo (Gmail es un ejemplo, pero puedes usar otros)
const transporter = nodemailer.createTransport(mail);

// Verificar la configuración del transportador
transporter.verify((error, success) => {
  if (error) {
    console.error('Error con el servicio de correo:', error);
  } else {
    console.log('Servidor de correo listo');
  }
});


module.exports = helpers;