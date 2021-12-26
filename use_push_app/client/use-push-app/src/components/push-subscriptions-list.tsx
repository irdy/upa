import React from "react";
import { View, Text } from "react-native";
import { Header } from "../header";
import { layoutStyles } from "../styles/common-styles";
import { Heading } from "./ui/headings/heading";
import { useLocation } from "react-router-dom";
import { PushNotificationStore } from "../stores/push-notification-store";

export const PushSubscriptionsList = React.memo(function PushSubscriptionsList() {

  const { state } = useLocation();
  const { contact_user_id } = state;

  React.useEffect(() => {
    PushNotificationStore.getInstance().getSubscribedDevices(contact_user_id)
      .then(data => {
        console.log("data", data)
      })
      .catch(err => { throw err })
  }, [contact_user_id]);

  return <View style={layoutStyles.page}>
    <Header />
    <View style={layoutStyles.content}>
      <Heading type={"h2"} title={"Subscriptions"} />
      <Text>List of active subscription for user {contact_user_id}</Text>
    </View>
  </View>
});

