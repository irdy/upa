import { getStore } from "./store";

type PushNotificationStoreSubjectNames = "notificationPermissionState" | "pushSubscription";

const Store = getStore<PushNotificationStoreSubjectNames>();

export class PushNotificationStore extends Store { }

PushNotificationStore.initSubject<NotificationPermission | PermissionState>("notificationPermissionState");
PushNotificationStore.initSubject<PushSubscription | null>("pushSubscription");

