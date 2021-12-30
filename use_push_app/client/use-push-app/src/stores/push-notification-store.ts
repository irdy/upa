import { getStore } from "./store";
import { api } from "./api.service";
import { Utils } from "../utils";

interface SubscribedDeviceData {
  subscribed_devices: SubscribedDevice[];
}

export interface SubscribedDevice {
  id: number,
  push_subscription_id: number,
  user_agent: string,
}


type PushNotificationStoreSubjectNames = "notificationPermissionState" | "pushSubscription" | "subscribedDevices";

const Store = getStore<PushNotificationStoreSubjectNames>();

export class PushNotificationStore extends Store {

  /**
   * save subscription on server
   */
  async savePushSubscription(subscription: PushSubscription, user_id: number) {
    const subscriptionData = JSON.stringify({
      payload: subscription // like a PushSubscriptionData interface
    });

    return api.call<PushSubscription>(`/api/users/${user_id}/push_subscriptions`, {
      body: subscriptionData
    })
  }

  /**
   * delete push subscription on server! e.g. user press "unsubscribe"
   * @param push_sub_endpoint
   */
  async deletePushSubscription(push_sub_endpoint: string) {
    // encode endpoint utl to base64
    const encoded_str = btoa(push_sub_endpoint);
    return api.call(`/api/push_subscriptions/${encoded_str}`, {
      method: "DELETE"
    })
  }

  @Store.withSubject<SubscribedDevice[]>("subscribedDevices")
  async getSubscribedDevices(user_id: number): Promise<SubscribedDevice[]> {
    const data = await api.call<SubscribedDeviceData>(`/api/users/${user_id}/subscribed_devices`, {
      method: "GET"
    });

    return Utils.checkDataExist(data.data).subscribed_devices;
  }

  async sendPushNotification(message_body: string, sub_ids: number[]) {
    const notificationData = JSON.stringify({
      payload: {
        message_body, sub_ids
      }
    });

    return api.call<SubscribedDeviceData>(`/api/push_subscriptions/send`, {
        body: notificationData
      }
    );
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

