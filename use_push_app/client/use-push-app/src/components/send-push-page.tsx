import { View, Text } from "react-native";
import { colorStyles, layoutStyles } from "../styles/common-styles";
import { Header } from "../header";
import React from "react";
import { Heading } from "./ui/headings/heading";
import { PushDataForm, PushDataFormValues } from "./ui/forms/push-data-form";
import { useLocation } from "react-router-dom";
import { PushNotificationStore } from "../stores/push-notification-store";

interface SendPushPageProps {
}

export interface SendPushNavState {
  sub_ids: number[],
  contact_name: string,
  user_agent: string
}

export function SendPushPage(props: SendPushPageProps) {
  const {state} = useLocation();
  const {contact_name, user_agent, sub_ids}: SendPushNavState = state;

  const onSubmit = React.useCallback(async (values: PushDataFormValues) => {
    try {
      return PushNotificationStore.getInstance().sendPushNotification(values.message_body, sub_ids)
      // todo message successfully delivered / message accepted, but client is not online, added to queue
    } catch (err) {
      throw err;
    }
  }, [sub_ids]);

  return <View style={layoutStyles.page}>
    <Header/>
    <View style={layoutStyles.content}>
      <View style={layoutStyles.mb_16}>
        <Heading type={"h2"} title={`Send Push to ${contact_name}`}/>
      </View>
      <View style={layoutStyles.mb_16}>
        <Text>
          <Text style={colorStyles.warning}>
            User Agent:
          </Text> {user_agent}</Text>
      </View>
      <PushDataForm onSubmit={onSubmit}/>
    </View>
  </View>

}