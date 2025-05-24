"use strict";
// import { Response, Request } from "express";
// const NotificationService = require("../services/notificationService");
// export const getNotifications = async (req: Request, res: Response) => {
//   try {
//     const { limit = 20, offset = 0 } = req.query;
//     const notifications = await NotificationService.getUserNotifications(
//       req.user?.id,
//       { limit: parseInt(limit), offset: parseInt(offset) }
//     );
//     res.json(notifications);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// export const markAsRead = async (req: Request, res: Response) => {
//   try {
//     const notification = await NotificationService.markAsRead(
//       req.user?.id,
//       req.params.id
//     );
//     res.json(notification);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };
// export const markAllAsRead = async (req: Request, res: Response) => {
//   try {
//     const notifications = await NotificationService.markAllAsRead(req.user.id);
//     res.json(notifications);
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// };
// export const getPreferences = async (req: Request, res: Response) => {
//   try {
//     const preferences = await UserNotificationPreference.findOne({
//       where: { userId: req.user.id },
//     });
//     res.json(preferences || {});
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// export const updatePreferences = async (req: Request, res: Response) => {
//   try {
//     const preferences = await NotificationService.updateNotificationPreferences(
//       req.user.id,
//       req.body
//     );
//     res.json(preferences);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };
