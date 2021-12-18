import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthStore } from "../stores/auth-store";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "./ui/buttons/app-button";
import { ContactsListContainer } from "./consumers/contacts-list-container";

function _Main() {
  const navigate = useNavigate();

  const signOut = React.useCallback(async () => {
    const authStore = AuthStore.getInstance();
    const result = await authStore.signOut();
    if (result.status === "success") {
      navigate("/sign_in");
    }
  }, [navigate]);

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
    navigate("/stub")
  }

  return (
    <View style={styles.root}>
      <Text>Main Page</Text>
      <AppButton onPress={signOut} title={"Sign Out"}/>
      <AppButton onPress={generateInvitationLink} title={"Generate Invitation Link"}/>
      <ContactsListContainer userId={19} contactListName={"DEFAULT_LIST"} />
      <ContactsListContainer userId={19} contactListName={"DEFAULT_LIST"} />
      <ContactsListContainer contactListName={"STRING_REPRESENTATION_LIST"} />
      <ContactsListContainer contactListName={"STRING_REPRESENTATION_LIST"} />
      <AppButton onPress={navigateToStub} title={"Stub Page"} />
    </View>
  )
}

export const Main = React.memo(_Main);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  }
});
