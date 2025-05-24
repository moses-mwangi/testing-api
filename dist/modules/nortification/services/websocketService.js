"use strict";
// // services/websocketService.js
// const WebSocket = require("ws");
// const { Notification } = require("../models");
// const clients = new Map(); // userId -> WebSocket
// function setupWebSocket(server) {
//   const wss = new WebSocket.Server({ server });
//   wss.on("connection", (ws, req) => {
//     // Extract user ID from auth token (implementation depends on your auth system)
//     const userId = getUserIdFromRequest(req);
//     if (userId) {
//       clients.set(userId, ws);
//       ws.on("close", () => {
//         clients.delete(userId);
//       });
//       ws.on("error", () => {
//         clients.delete(userId);
//       });
//     }
//   });
// }
// async function sendRealTimeNotification(userId, notification) {
//   const ws = clients.get(userId);
//   if (ws && ws.readyState === WebSocket.OPEN) {
//     ws.send(
//       JSON.stringify({
//         type: "NEW_NOTIFICATION",
//         data: notification,
//       })
//     );
//   }
// }
// // Call this after creating a notification
// async function notifyUser(userId, notificationData) {
//   const notification = await NotificationService.createNotification(
//     userId,
//     notificationData
//   );
//   await sendRealTimeNotification(userId, notification);
//   return notification;
// }
// module.exports = {
//   setupWebSocket,
//   sendRealTimeNotification,
//   notifyUser,
// };
// backend/src/servers/websocket.ts
// import WebSocket from "ws";
// import { notificationDispatcher } from "../services";
// const wss = new WebSocket.Server({ port: 8080 });
// wss.on("connection", (ws, req) => {
//   const userId = authenticate(req); // From JWT
//   // Listen for new notifications from other services
//   notificationDispatcher.onNewNotification(userId, (notification) => {
//     ws.send(JSON.stringify({
//       type: "NOTIFICATION",
//       data: notification
//     }));
//   });
// });
