import { ErrorStore } from "../stores/error.store";
import * as serviceWorkerRegistration from "../serviceWorkerRegistration";
import { PushNotificationStore } from "../stores/push-notification-store";

export class PushSubscriptionManager {

  static getPushUnsupportedError(): string | null {
    const serviceWorkerSupported = "serviceWorker" in navigator;
    const pushManagerSupported = "PushManager" in window;
    const notificationSupported = "Notification" in window;

    if (!serviceWorkerSupported || !pushManagerSupported || !notificationSupported) {
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
    return new Promise((resolve) => {
      try {
        serviceWorkerRegistration.register({
          onSuccess: (registration) => {
            console.log("Service worker successfully registered!");
            resolve(registration);
          }
        });
      } catch (err) {
        console.error(err);
        throw new Error("Unable to register service worker");
      }
    });
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

  @PushNotificationStore.withSubject<NotificationPermission | PermissionState>("notificationPermissionState")
  static async getNotificationPermissionState(): Promise<PermissionState | NotificationPermission> {
    if (navigator.permissions) {
      const result = await navigator.permissions.query({name: 'notifications'});
      return result.state;
    }

    return Notification.permission;
  }

}