import React from "react";
import { AppButton } from "./ui/buttons/app-button";
import { PushSubscriptionManager } from "../helpers/push-subscription-manager";
import { Text } from 'react-native';
import { Preloader } from "./ui/other/preloader";
import { useObservable } from "../hooks/useObservable";
import { PushNotificationStore } from "../stores/push-notification-store";
import { colorStyles } from "../styles/common-styles";
import { UserStore } from "../stores/user-store";

export const PushSubscriptionContainer = React.memo(function PushSubscriptionContainer() {
  const unsupportedError = PushSubscriptionManager.getPushUnsupportedError();

  if (unsupportedError) {
    return <Text>{unsupportedError}</Text>
  }

  return <PushSubscriptionControls/>
});

function PushSubscriptionControls() {
  const pushSubscriptionSubject = PushNotificationStore.getInstance().getSubject<PushSubscription | null>(
    "pushSubscription"
  );

  const subscribe = React.useCallback(async () => {
    // todo handle PermissionState with UI
    const permissionResult = await PushSubscriptionManager.askPermission();

    if (permissionResult === "granted") {
      const pushSubscription = await PushSubscriptionManager.subscribeUserToPush();
      const user_id = UserStore.getInstance().getUserData().id;
      try {
        await PushNotificationStore.getInstance().savePushSubscription(pushSubscription, user_id);
        pushSubscriptionSubject.next(pushSubscription);
        console.log("subscription was successfully created and saved on server")
        // todo notify user about success
      } catch (err) {
        // server-side error on subscription saving, cancel  browser subscription
        console.log("Unable to save subscription on server, unsubscribe subscription...")
        await PushSubscriptionManager.unsubscribeUserFromPush();
        // todo notify user about failure
      }
    } else if (permissionResult === "denied") {
      // ? You must allow notifications for correct workflow ?
    }
  }, [pushSubscriptionSubject]);

  const unsubscribe = React.useCallback(async () => {
    const subscription = await PushSubscriptionManager.getSubscription();
    const {endpoint} = subscription ?? {};
    const result = await PushSubscriptionManager.unsubscribeUserFromPush();
    if (result) {
      pushSubscriptionSubject.next(null);
      if (endpoint) {
        await PushNotificationStore.getInstance().deletePushSubscription(endpoint);
        console.log("subscription was successfully deleted!")
        // todo notify user about success/failure
      }
    }
  }, [pushSubscriptionSubject]);

  const [permissionState] = useObservable(
    PushNotificationStore.getInstance().getSubject<NotificationPermission | PermissionState>(
      "notificationPermissionState"
    )
  );

  const [pushSubscription] = useObservable(pushSubscriptionSubject);

  React.useEffect(() => {
    PushSubscriptionManager.getSubscription().catch(err => {
      throw err
    });
    PushSubscriptionManager.getNotificationPermissionState().catch(err => {
      throw err
    });
  }, []);

  if (permissionState === undefined || pushSubscription === undefined) {
    return <Preloader/>
  }

  if (pushSubscription === null) {
    return <>
      {
        permissionState === "denied"
          /* // todo attach gif || message "please enable notifications in browser settings" */
          ? <Text style={colorStyles.warning}>You are block Push Notifications. Please allow it in site settings!</Text>
          : <AppButton onPress={subscribe} title={"Subscribe"} asyncDisable/>
      }
    </>
  }

  return (
    <AppButton onPress={unsubscribe} title={"Unsubscribe"} asyncDisable/>
  )
}

