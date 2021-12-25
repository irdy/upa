import { ErrorStore } from "../stores/error.store";
import { PushNotificationStore } from "../stores/push-notification-store";

export class PushSubscriptionManager {

  static pushNotificationsUnsupported(): boolean {
    const serviceWorkerSupported = "serviceWorker" in navigator;
    const pushManagerSupported = "PushManager" in window;
    const notificationSupported = "Notification" in window;

    return !serviceWorkerSupported || !pushManagerSupported || !notificationSupported
  }


  static getPushUnsupportedError(): string | null {
    if (PushSubscriptionManager.pushNotificationsUnsupported()) {
      const errMsg = "Push Notifications isn't supported on this browser!";
      ErrorStore.emitError({message: errMsg});
      return errMsg;
    }

    return null;
  }

  @PushNotificationStore.withSubject<NotificationPermission | PermissionState>("notificationPermissionState")
  static async askPermission(): Promise<NotificationPermission | PermissionState> {
    return Notification.requestPermission();
  }

  static async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (PushSubscriptionManager.pushNotificationsUnsupported()) {
      console.error("pushNotificationsUnsupported");
    }

    const swPath = `${process.env.PUBLIC_URL}/sw.js`;
    return navigator.serviceWorker.register(swPath);
  }

  static async subscribeUserToPush(): Promise<PushSubscription> {
    //const registration = await PushSubscriptionManager.registerServiceWorker();
    let registration = await navigator.serviceWorker.getRegistration();
    if (registration === undefined) {
      registration = await PushSubscriptionManager.registerServiceWorker();
    }

    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: process.env.REACT_APP_PUSH_VAPID_PUBLIC_KEY
    };

    return registration.pushManager.subscribe(subscribeOptions);
  }

  @PushNotificationStore.withSubject<PushSubscription | null>("pushSubscription")
  static async getSubscription(): Promise<PushSubscription | null> {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      throw Error("Service worker registration is undefined");
    }

    return registration.pushManager.getSubscription();
  }

  static async unsubscribeUserFromPush(): Promise<boolean> {
    const subscription = await PushSubscriptionManager.getSubscription();
    if (subscription === null) {
      throw Error("User tries to unsubscribe from push notifications, but push subscription is null");
    }
    return subscription.unsubscribe();
  }

  @PushNotificationStore.withSubject<NotificationPermission | PermissionState>("notificationPermissionState")
  static async getNotificationPermissionState(): Promise<PermissionState | NotificationPermission> {
    if (navigator.permissions) {
      const result = await navigator.permissions.query({name: 'notifications'});
      return result.state;
    }

    return Notification.permission;
  }

}