import React from "react";
import { AuthStore } from "../stores/auth-store";
import { StyleSheet, View } from "react-native";
import { AppButton } from "./ui/buttons/app-button";
import { ContactsListContainer } from "./consumers/contacts-list-container";
import { UserData, UserStore } from "../stores/user-store";
import { useObservable } from "../hooks/useObservable";
import { Preloader } from "./ui/other/preloader";
import { Header } from "../header";
import { layoutStyles } from "../styles/common-styles";
import { PushSubscriptionContainer } from "./push-subscription-container";
import QRCode from 'qrcode';


function _Main() {
  const [userData] = useObservable<UserData>(UserStore.getInstance().getSubject("userData"));

  const generateInvitationLink = React.useCallback(async () => {
    const authStore = AuthStore.getInstance();
    const result = await authStore.generateInvitationLink();
    const { data } = result;
    if (!data) {
      throw Error("Unexpected nullish data")
    }

    const full_link = window.location.host + "/sign_up/" + data.link_uuid;

    console.log("full_link", full_link);
    QRCode.toCanvas(document.getElementById('qr-code-canvas'), full_link, function (error) {
      if (error) console.error(error)
      console.log('qr-code successfully generated!');
    });

  }, []);

  if (userData === undefined) {
    return <Preloader />
  }

  return (
    <View style={layoutStyles.root}>
      <Header />
      <View style={layoutStyles.content}>
        <View style={layoutStyles.mb_16}>
          <AppButton onPress={generateInvitationLink} title={"Generate Invitation Link"}/>
        </View>

        <View style={styles.qrCodeCanvasWrapper}>
          <canvas id="qr-code-canvas"> </canvas>
        </View>

        <View style={layoutStyles.mb_16}>
          <PushSubscriptionContainer />
        </View>
        <ContactsListContainer userId={userData.id} contactListName={"DEFAULT_LIST"} />
      </View>
    </View>
  )
}

export const Main = React.memo(_Main);

export const styles = StyleSheet.create({
  qrCodeCanvasWrapper: {
    marginBottom: 18
  }
})
