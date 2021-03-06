const Express = require('express');

const NotificationController = require('../controller/notification.controller');

const Router = Express.Router();


Router.route('/send')
    .post(NotificationController.sendNotification);
Router.route("/save-token")
    .post(NotificationController.saveRegistrationTokenForUser);
Router.route("/send-admin")
    .post(NotificationController.sendNotificationToAdmin);

module.exports = Router;