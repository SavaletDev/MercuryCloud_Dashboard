const router = require('express').Router();
const server = require('../../server.js')
const jsonParser = server.parser.json()
const route_name = "/services"
const permissions_manager = require("../../utils/permissions-manager")
const config = require('../../config.json')
server.logger(" [INFO] /api" + route_name + " route loaded !")

router.get('', function (req, res) {
  const start = process.hrtime()
  ipInfo = server.ip(req);
  let IP = ""
  if (req.headers['x-forwarded-for'] == undefined) {
    IP = req.socket.remoteAddress.replace("::ffff:", "")
  } else {
    IP = req.headers['x-forwarded-for'].split(',')[0]
  }
  const sql = `SELECT token FROM users WHERE uuid = '${req.cookies.uuid}'`;
  server.con.query(sql, function (err, result) {
    if (err) { server.logger(" [ERROR] Database error\n  " + err) };
    if (result.length == 0) {
      return res.json({ 'error': true, 'code': 404 })
    } else {
      if (result[0].token === req.cookies.token) {
        permissions_manager.has_permission(req.cookies.uuid, "LISTSERVICES").then(function (result) {
          if (result) {
            const sql = `SELECT * FROM services;`;
            server.con.query(sql, function (err, result) {
              if (err) { server.logger(" [ERROR] Database error\n  " + err) }
              server.fetch(config.pterodactyl_url + "/api/application/servers", {
                "method": "GET",
                "headers": {
                  "Accept": "application/json",
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${config.pterodactyl_api_key}`,
                }
              }).then(response => {
                return response.json()
              }).then(data => {
                let servers = []
                for (let i = 0; i < data.data.length; i++) {
                  for (let ii = 0; ii < result.length; ii++) {
                    const configuration = JSON.parse(result[ii].configuration)
                    if (configuration.id == data.data[i].attributes.id) {
                      servers.push({
                        'ptero_i': i,
                        'service_i': ii
                      })
                    }
                  }
                }
                let services = []
                for (let i = 0; i < result.length; i++) {
                  if (result[i].category == "pterodactyl") {
                    if (data.data[servers[i].ptero_i].attributes.suspended == true) {
                      statut = "suspended"
                    } else if (data.data[servers[i].ptero_i].attributes.container.installed == false) {
                      statut = "installing"
                    } else {
                      statut = "active"
                    }
                    services.push({
                      "id": result[i].id,
                      "uuid": result[i].uuid,
                      "name": result[i].name,
                      "product_id": result[i].product_id,
                      "price": result[i].price,
                      "category": result[i].category,
                      "statut": statut
                    })
                  } else if (result[i].category == "proxmox") {
                    services.push({
                      "id": result[i].id,
                      "uuid": result[i].uuid,
                      "name": result[i].name,
                      "product_id": result[i].product_id,
                      "price": result[i].price,
                      "category": result[i].category,
                      "statut": result[i].statut
                    })
                  }
                }
                return res.json({ 'error': false, 'data': services })
              }).catch(err => { server.logger(" [ERROR] Pterodactyl API error : " + err); return res.json({ "error": true, "code": 503, "msg": "Pterodactyl API error : " + err }) })
            });
          } else {
            const sql = `SELECT * FROM services WHERE uuid = '${req.cookies.uuid}';`;
            server.con.query(sql, function (err, result) {
              if (err) { server.logger(" [ERROR] Database error\n  " + err) }
              server.fetch(config.pterodactyl_url + "/api/application/servers", {
                "method": "GET",
                "headers": {
                  "Accept": "application/json",
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${config.pterodactyl_api_key}`,
                }
              }).then(response => {
                return response.json()
              }).then(data => {
                let servers = []
                for (let i = 0; i < data.data.length; i++) {
                  for (let ii = 0; ii < result.length; ii++) {
                    const configuration = JSON.parse(result[ii].configuration)
                    if (configuration.id == data.data[i].attributes.id) {
                      servers.push({
                        'ptero_i': i,
                        'service_i': ii
                      })
                    }
                  }
                }
                let services = []
                for (let i = 0; i < result.length; i++) {
                  if (result[i].category == "pterodactyl") {
                    if (data.data[servers[i].ptero_i].attributes.suspended == true) {
                      statut = "suspended"
                    } else if (data.data[servers[i].ptero_i].attributes.container.installed == false) {
                      statut = "installing"
                    } else {
                      statut = "active"
                    }
                    services.push({
                      "id": result[i].id,
                      "uuid": result[i].uuid,
                      "name": result[i].name,
                      "product_id": result[i].product_id,
                      "price": result[i].price,
                      "category": result[i].category,
                      "statut": statut
                    })
                  } else if (result[i].category == "proxmox") {
                    services.push({
                      "id": result[i].id,
                      "uuid": result[i].uuid,
                      "name": result[i].name,
                      "product_id": result[i].product_id,
                      "price": result[i].price,
                      "category": result[i].category,
                      "statut": result[i].statut
                    })
                  }
                }
                return res.json({ 'error': false, 'data': services })
              }).catch(err => { server.logger(" [ERROR] Pterodactyl API error : " + err); return res.json({ "error": true, "code": 503, "msg": "Pterodactyl API error : " + err }) })
            });
          }
        })
      } else {
        return res.json({ 'error': true, 'code': 403 })
      }
    }
  });
  res.on('finish', () => {
    const durationInMilliseconds = server.getDurationInMilliseconds(start)
    server.logger(` [DEBUG] ${req.method} ${route_name} [FINISHED] [FROM ${IP}] in ${durationInMilliseconds.toLocaleString()} ms`)
  })
})

router.post('', jsonParser, function (req, res) {
  const start = process.hrtime()
  ipInfo = server.ip(req);
  let IP = ""
  if (req.headers['x-forwarded-for'] == undefined) {
    IP = req.socket.remoteAddress.replace("::ffff:", "")
  } else {
    IP = req.headers['x-forwarded-for'].split(',')[0]
  }
  const sql = `SELECT token FROM users WHERE uuid = '${req.cookies.uuid}'`;
  server.con.query(sql, function (err, result) {
    if (err) { server.logger(" [ERROR] Database error\n  " + err) };
    if (result.length == 0) {
      return res.json({ 'error': true, 'code': 404 })
    } else {
      if (result[0].token === req.cookies.token) {
        const sql = `SELECT * FROM products WHERE id = '${req.body.product_id}'`;
        server.con.query(sql, async function (err, result) {
          if (err) { server.logger(" [ERROR] Database error\n  " + err) };
          if (result[0].category == "pterodactyl") {
            const docker_img = "ghcr.io/pterodactyl/yolks:java_17"
            configuration = JSON.parse(result[0].configuration)
            let body = {
              'name': result[0].name + " " + req.body.srv_info.srv_name,
              "user": 1,
              "egg": parseInt(configuration.egg),
              'docker_image': docker_img,
              'startup': configuration.startup_command,
              "limits": {
                "memory": parseInt(configuration.ram),
                "swap": parseInt(configuration.swap),
                "disk": parseInt(configuration.disk),
                "io": parseInt(configuration.io),
                "cpu": parseInt(configuration.cpu)
              },
              "feature_limits": {
                'databases': parseInt(req.body.srv_info.db_sup),
                'allocations': 0,
                'backups': parseInt(req.body.srv_info.bkp_sup),
              },
              "environment": configuration.env,
              "allocation": {
                "default": 1,
                "addtional": []
              },
              "deploy": {
                "locations": [2],
                "dedicated_ip": false,
                "port_range": []
              },
              "start_on_completion": false,
              "skip_scripts": false,
              "oom_disabled": true
            }
            server.fetch(config.pterodactyl_url + "/api/application/servers", {
              "method": "POST",
              "headers": {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${config.pterodactyl_api_key}`,
              },
              "body": JSON.stringify(body)
            }).then(response => {
              return response.json()
            }).then(data => {
              server.mail_transporter.sendMail({
                from: config.smtp_username,
                to: req.body.user_info.mail,
                subject: "Service " + req.body.srv_info.srv_name + " créé avec succès !",
                html: "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'><html xmlns='http://www.w3.org/1999/xhtml'> <head> <meta name='viewport' content='width=device-width, initial-scale=1.0'/> <meta name='x-apple-disable-message-reformatting'/> <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'/> <meta name='color-scheme' content='light dark'/> <meta name='supported-color-schemes' content='light dark'/> <title></title> <style type='text/css' rel='stylesheet' media='all'> @import url('https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap'); body{width: 100% !important; height: 100%; margin: 0; -webkit-text-size-adjust: none;}a{color: #3a57e8; font-size: larger;}p{font-size: larger;}a img{border: none;}td{word-break: break-word;}.preheader{display: none !important; visibility: hidden; mso-hide: all; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden;}/* Type ------------------------------ */ body, td, th{font-family: 'Nunito Sans', Helvetica, Arial, sans-serif;}h1{margin-top: 0; color: #151824; font-size: 22px; font-weight: bold; text-align: left;}h2{margin-top: 0; color: #151824; font-size: 16px; font-weight: bold; text-align: left;}h3{margin-top: 0; color: #151824; font-size: 14px; font-weight: bold; text-align: left;}td, th{font-size: 16px;}p, ul, ol, blockquote{margin: .4em 0 1.1875em; font-size: 16px; line-height: 1.625;}p.sub{font-size: 13px;}/* Utilities ------------------------------ */ .align-right{text-align: right;}.align-left{text-align: left;}.align-center{text-align: center;}.u-margin-bottom-none{margin-bottom: 0;}/* Buttons ------------------------------ */ .button{background-color: #3a57e8; border-top: 10px solid #3a57e8; border-right: 18px solid #3a57e8; border-bottom: 10px solid #3a57e8; border-left: 18px solid #3a57e8; display: inline-block; color: #FFF; text-decoration: none; border-radius: 3px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); -webkit-text-size-adjust: none; box-sizing: border-box;}@media only screen and (max-width: 500px){.button{width: 100% !important; text-align: center !important;}}/* Attribute list ------------------------------ */ .attributes{margin: 0 0 21px;}.attributes_content{background-color: #F4F4F7; padding: 16px;}.attributes_item{padding: 0;}/* Related Items ------------------------------ */ .related{width: 100%; margin: 0; padding: 25px 0 0 0; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0;}.related_item{padding: 10px 0; color: #CBCCCF; font-size: 15px; line-height: 18px;}.related_item-title{display: block; margin: .5em 0 0;}.related_item-thumb{display: block; padding-bottom: 10px;}.related_heading{border-top: 1px solid #151824; text-align: center; padding: 25px 0 10px;}/* Discount Code ------------------------------ */ .discount{width: 100%; margin: 0; padding: 24px; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #151824; border: 2px dashed #151824;}.discount_heading{text-align: center;}.discount_body{text-align: center; font-size: 15px;}/* Social Icons ------------------------------ */ .social{width: auto;}.social td{padding: 0; width: auto;}.social_icon{height: 20px; margin: 0 8px 10px 8px; padding: 0;}body{background-color: #F2F4F6; color: #151824;}.email-wrapper{width: 100%; margin: 0; padding: 0; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #F2F4F6;}.email-content{width: 100%; margin: 0; padding: 0; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0;}/* Masthead ----------------------- */ .email-masthead{padding: 25px 0; text-align: center;}.email-masthead_logo{width: 94px;}.email-masthead_name{font-size: 16px; font-weight: bold; color: #151824; text-decoration: none; text-shadow: 0 1px 0 white;}/* Body ------------------------------ */ .email-body{width: 100%; margin: 0; padding: 0; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0;}.email-body_inner{width: 570px; margin: 0 auto; padding: 0; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #FFFFFF;}.email-footer{width: 570px; margin: 0 auto; padding: 0; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center;}.body-action{width: 100%; margin: 30px auto; padding: 0; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center;}.body-sub{margin-top: 25px; padding-top: 25px; border-top: 1px solid #EAEAEC;}.content-cell{padding: 45px;}/*Media Queries ------------------------------ */ @media only screen and (max-width: 600px){.email-body_inner, .email-footer{width: 100% !important;}}@media (prefers-color-scheme: dark){body, .email-body, .email-body_inner, .email-content, .email-wrapper, .email-masthead, .email-footer{background-color: #151824 !important; color: #FFF !important;}p, ul, ol, blockquote, h1, h2, h3, span, .purchase_item{color: #FFF !important;}.attributes_content, .discount{background-color: #222 !important;}.email-masthead_name{text-shadow: none !important;}}:root{color-scheme: light dark; supported-color-schemes: light dark;}</style><!--[if mso]> <style type='text/css'> .f-fallback{font-family: Arial, sans-serif;}</style><![endif]--> </head> <body> <table class='email-wrapper' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td align='center'> <table class='email-content' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='email-masthead'> <image src='https://cdn.mercurycloud.fr/TaWe3/NewIRUha22.png/raw' height='75' width='75'></image> </br> </br> <a>Mercury Cloud</a> </td></tr><tr> <td class='email-body' width='570' cellpadding='0' cellspacing='0'> <table class='email-body_inner' align='center' width='570' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='content-cell'> <div class='f-fallback'> <h1>Bonjour,</h1> <p>Votre nouveau service " + req.body.srv_info.srv_name + " à bien été créé</p><table class='body-action' align='center' width='100%' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td align='center'> <table width='100%' border='0' cellspacing='0' cellpadding='0' role='presentation'> <tr> <td align='center'> <a href='https://dash.mercurycloud.fr/' class='f-fallback button' target='_blank'>Accéder au tableau de bord</a> </td></tr></table> </td></tr></table> <p>Vous pouvez gérer votre nouveau service Mercury Cloud sur le tableau de bord (bouton si dessus). Sur se tableau de bord vous pouvez aussi gérer vos paiements, factures, commandes et bien plus.</p></td></tr><tr> <td> <table class='email-footer' align='center' width='570' cellpadding='0' cellspacing='0' role='presentation'> <tr> <td class='content-cell' align='center'> <p class='f-fallback sub align-center'> Mercury Cloud 2022</p></td></tr></table> </td></tr></table> </td></tr></table> </body></html>",
              })
              service_configuration = {
                'id': data.attributes.id,
                'identifier': data.attributes.identifier,
                'uuid': data.attributes.uuid
              }
              service_id = server.crypto.randomBytes(3).toString('hex')
              const sql = `INSERT INTO services (id, uuid, name, product_id, price, category, configuration, statut) VALUES('${service_id}', '${req.cookies.uuid}', '${req.body.srv_info.srv_name}', '${req.body.product_id}', '${result[0].price}', 'pterodactyl', '${JSON.stringify(service_configuration)}', 'installing')`;
              server.con.query(sql, function (err, result) {
                if (err) { server.logger(" [ERROR] Database error\n  " + err) };
              });
              server.logger(" [DEBUG] Email to " + req.body.user_info.mail + " from " + config.smtp_username + " sent !")
              server.logger(" [DEBUG] New service : " + req.body.srv_info.srv_name + " !")
              server.services_action_logger(service_id, req.cookies.uuid, IP, "Création du service " + req.body.srv_info.srv_name)
              return res.json({ "error": false, "response": "OK" });
            }).catch(err => { server.logger(" [ERROR] Pterodactyl API error : " + err); return req.json({ "error": true, "code": 503, "msg": "Pterodactyl API error : " + err }) })
          } else if (result[0].category == "proxmox") {

          } else {
            return res.json({ 'error': true, 'code': 404 })
          }
        });
      } else {
        return res.json({ 'error': true, 'code': 403 })
      }
    }
  })
  res.on('finish', () => {
    const durationInMilliseconds = server.getDurationInMilliseconds(start)
    server.logger(` [DEBUG] ${req.method} ${route_name} [FINISHED] [FROM ${IP}] in ${durationInMilliseconds.toLocaleString()} ms`)
  })
})

module.exports = router;