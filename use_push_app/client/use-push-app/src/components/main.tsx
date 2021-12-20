import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthStore } from "../stores/auth-store";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "./ui/buttons/app-button";
import { ContactsListContainer } from "./consumers/contacts-list-container";
import { UserData, UserStore } from "../stores/user-store";
import { useObservable } from "../hooks/useObservable";
import { Preloader } from "./ui/other/preloader";
import { Header } from "../header";
import { layoutStyles } from "../styles/common-styles";

function _Main() {
  const navigate = useNavigate();
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

  function navigateToStub() {
    navigate("/push_subscriptions") // todo interface?
  }

  if (userData === undefined) {
    return <Preloader />
  }

  return (
    <View style={layoutStyles.root}>
      <Header />
      <View style={layoutStyles.content}>
        <AppButton onPress={generateInvitationLink} title={"Generate Invitation Link"}/>
        <AppButton onPress={navigateToStub} title={"Subscriptions"} />
        <ContactsListContainer userId={userData.id} contactListName={"DEFAULT_LIST"} />
      </View>
    </View>
  )
}

export const Main = React.memo(_Main);
