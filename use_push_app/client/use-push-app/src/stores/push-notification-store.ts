import { getStore } from "./store";
import { api } from "./api.service";

type PushNotificationStoreSubjectNames = "notificationPermissionState" | "pushSubscription";

const Store = getStore<PushNotificationStoreSubjectNames>();

export class PushNotificationStore extends Store {

  /**
   * save subscription on server
   */
  async savePushSubscription(subscription: PushSubscription, user_id: number) {
    const subscriptionData = JSON.stringify({
      payload: subscription // like a PushSubscriptionData interface
    });
    console.log("subscriptionData", subscriptionData);
    return api.call<PushSubscription>(`/api/users/${user_id}/push_subscriptions`, {
      body: subscriptionData
    })
  }
}

PushNotificationStore.initSubject<NotificationPermission | PermissionState>("notificationPermissionState");
PushNotificationStore.initSubject<PushSubscription | null>("pushSubscription");

/*
interface PushSubscriptionData {
  endpoint: string,
  expirationTime: number | null,
  keys: {
    p256dh: ArrayBuffer | null,
    auth: ArrayBuffer | null
  }
}
*/

