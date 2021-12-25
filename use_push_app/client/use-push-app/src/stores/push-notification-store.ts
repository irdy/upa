import { getStore } from "./store";

type PushNotificationStoreSubjectNames = "notificationPermissionState";

const Store = getStore<PushNotificationStoreSubjectNames>();

export class PushNotificationStore extends Store { }

PushNotificationStore.initSubject<NotificationPermission | PermissionState>("notificationPermissionState");

