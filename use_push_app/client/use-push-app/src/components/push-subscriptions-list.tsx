import React from "react";
import { View, Text, FlatList } from "react-native";
import { Header } from "../header";
import { layoutStyles } from "../styles/common-styles";
import { Heading } from "./ui/headings/heading";
import { useLocation, useNavigate } from "react-router-dom";
import { PushNotificationStore, SubscribedDevice } from "../stores/push-notification-store";
import { useObservable } from "../hooks/useObservable";
import { Preloader } from "./ui/other/preloader";
import { AppListItemClickable } from "./ui/lists/app-list";
import { PushSubscriptionNavState } from "./contacts-list";
import { SendPushNavState } from "./send-push-page";

interface SubscribedDeviceItem {
  item: SubscribedDevice
}

export const PushSubscriptionsList = React.memo(function PushSubscriptionsList() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { contact_user_id, contact_name }: PushSubscriptionNavState = state;

  const renderItem = React.useCallback(({ item }: SubscribedDeviceItem) => {
    console.log("item", item);

    function onPress() {
      const sendPushNavState: SendPushNavState = {
        sub_ids: [item.push_subscription_id]
      }

      navigate("/send_push", {
        state: sendPushNavState
      })
    }

    return <AppListItemClickable title={item.user_agent} onPress={onPress} />;
  }, [navigate]);

  const keyExtractor = React.useCallback((item) => item.id, []);

  const [subscribedDevicesList] = useObservable(
    PushNotificationStore.getInstance().getSubject<SubscribedDevice[]>("subscribedDevices")
  )

  React.useEffect(() => {
    PushNotificationStore.getInstance().getSubscribedDevices(contact_user_id).finally();
  }, [contact_user_id]);

  if (subscribedDevicesList === undefined) {
    return <Preloader />
  }

  return <View style={layoutStyles.page}>
    <Header />
    <View style={layoutStyles.content}>
      <Heading type={"h2"} title={"Subscriptions"} />
      <Text>List of active subscription for user {contact_name}</Text>
      <FlatList
        data={subscribedDevicesList}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </View>
  </View>
});

