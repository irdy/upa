import { View } from "react-native";
import { layoutStyles } from "../styles/common-styles";
import { Header } from "../header";
import React from "react";
import { Heading } from "./ui/headings/heading";
import { PushDataForm, PushDataFormValues } from "./ui/forms/push-data-form";
import { useLocation } from "react-router-dom";
import { PushNotificationStore } from "../stores/push-notification-store";

interface SendPushPageProps { }

export interface SendPushNavState {
  sub_ids: number[]
}

export function SendPushPage(props: SendPushPageProps) {
  const { state } = useLocation();
  const { sub_ids }: SendPushNavState = state;

  console.log(sub_ids)

  const onSubmit = React.useCallback(async (values: PushDataFormValues) => {
    try {
      return PushNotificationStore.getInstance().sendPushNotification(values.message_body, sub_ids)
      // todo message successfully delivered / message accepted, but client is not online, added to queue
    } catch (err) {
      throw err;
    }
  }, [sub_ids]);

  return <View style={layoutStyles.page}>
    <Header />
    <View style={layoutStyles.content}>
      <Heading type={"h2"} title={"Send Push"} />
      <PushDataForm onSubmit={onSubmit} />
    </View>
  </View>

}