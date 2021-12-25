import React from "react";
import { AppButton } from "./ui/buttons/app-button";
import { PushSubscriptionManager } from "../helpers/push-subscription-manager";
import { Text } from 'react-native';
import { Preloader } from "./ui/other/preloader";
import { useObservable } from "../hooks/useObservable";
import { PushNotificationStore } from "../stores/push-notification-store";

export const PushSubscriptionContainer = React.memo(function PushSubscriptionContainer() {
  const unsupportedError = PushSubscriptionManager.getPushUnsupportedError();

  if (unsupportedError) {
    return <Text>{unsupportedError}</Text>
  }

  return <PushSubscriptionControls />
});

function PushSubscriptionControls() {
  const subscribe = React.useCallback(async () => {
    const permissionResult = await PushSubscriptionManager.askPermission();
    console.log("permissionResult", permissionResult);
    if (permissionResult === "granted") {
      const pushSubscription = await PushSubscriptionManager.subscribeUserToPush();
      console.log("pushSubscription", pushSubscription);

      // todo save to server
    } else if (permissionResult === "denied") {
      // ? You must allow notifications for correct workflow
    }
  }, []);

  const showAllowNotificationMessage = React.useCallback(() => {
    // todo attach gif || message "please enable notifications in browser settings"
    console.log("please enable/disable notifications in browser settings");
  }, []);

  const unsubscribe = React.useCallback(async () => {
    // todo disable: how to unsubscribe?
    console.log("unsubscribe logic!!!");
  }, []);

  const SubscriptionControls = React.useRef<Record<NotificationPermission | PermissionState, React.FunctionComponent>>({
    denied: () => <AppButton onPress={showAllowNotificationMessage} title={"Allow Notifications"} />,
    granted: () => <AppButton onPress={unsubscribe} title={"Unsubscribe"} />,
    prompt: () => <AppButton onPress={subscribe} title={"Subscribe"} />,
    default: () => <AppButton onPress={subscribe} title={"Subscribe"} />
  });

  const [permissionState] = useObservable(
    PushNotificationStore.getInstance().getSubject<NotificationPermission | PermissionState>(
      "notificationPermissionState"
    )
  );

  React.useEffect(() => {
    PushSubscriptionManager.getNotificationPermissionState().catch(err => { throw err });
  }, []);

  if (permissionState === undefined) {
    return <Preloader />
  }

  const Component = SubscriptionControls.current[permissionState];

  return (
    <Component />
  )
}

