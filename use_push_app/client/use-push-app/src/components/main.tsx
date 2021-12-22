import React from "react";
import { AuthStore } from "../stores/auth-store";
import { View } from "react-native";
import { AppButton } from "./ui/buttons/app-button";
import { ContactsListContainer } from "./consumers/contacts-list-container";
import { UserData, UserStore } from "../stores/user-store";
import { useObservable } from "../hooks/useObservable";
import { Preloader } from "./ui/other/preloader";
import { Header } from "../header";
import { layoutStyles } from "../styles/common-styles";
import { ErrorStore } from "../stores/error.store";

// todo вынести логику в класс
async function askPermission() {
  if (!("Notification" in window)) {
    const errMessage = "This browser does not support desktop notification";
    ErrorStore.emitError({
      message: errMessage
    });
  }

  const permissionResult = await Notification.requestPermission();
  switch (permissionResult) {
    case "denied":
      // todo handle with UI! Corresponded Image Of Browser Panel
      console.log("Notification permission is denied!");
      break;
    case "granted":
      console.log("Notification permission is granted!");
      break;
    default:
      console.log("user cancelled notification prompt");
  }
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  try {
    return navigator.serviceWorker.register('service-worker.js')
  } catch (err) {
    // handle the error
    ErrorStore.emitError({
      message: "Unable to register service worker"
    });
    throw err;
  }
}

async function subscribeUserToPush(): Promise<PushSubscription> {
  const registration = await registerServiceWorker();
  console.log('Service worker successfully registered. Registration', registration);

  const subscribeOptions = {
    userVisibleOnly: true,
    applicationServerKey: process.env.REACT_APP_PUSH_VAPID_PUBLIC_KEY
  };

  return registration.pushManager.subscribe(subscribeOptions);
}

function _Main() {
  const [userData] = useObservable<UserData>(UserStore.getInstance().getSubject("userData"));

  const generateInvitationLink = React.useCallback(async () => {
    const authStore = AuthStore.getInstance();
    const result = await authStore.generateInvitationLink();
    const { data } = result;
    if (data?.link_uuid) {
      console.log("link_uuid", data.link_uuid)
    } else {
      console.log("link_uuid", data?.link_uuid)
    }
  }, []);

  const subscribe = React.useCallback(async () => {
    if (!("serviceWorker" in navigator)) {
      ErrorStore.emitError({message: "Push isn't supported on this browser (service worker unsupported"});
      return;
    }

    if (!("PushManager" in window)) {
      ErrorStore.emitError({message: "Push isn't supported on this browser"});
      return;
    }

    await askPermission();
    console.log("REACT_APP_PUSH_VAPID_PUBLIC_KEY", process.env.REACT_APP_PUSH_VAPID_PUBLIC_KEY);
    const pushSubscription = await subscribeUserToPush();
    console.log("pushSubscription", pushSubscription);
  }, []);

  if (userData === undefined) {
    return <Preloader />
  }

  return (
    <View style={layoutStyles.root}>
      <Header />
      <View style={layoutStyles.content}>
        <AppButton onPress={generateInvitationLink} title={"Generate Invitation Link"}/>
        <AppButton onPress={subscribe} title={"Subscribe"}/>
        <ContactsListContainer userId={userData.id} contactListName={"DEFAULT_LIST"} />
      </View>
    </View>
  )
}

export const Main = React.memo(_Main);
