import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthStore } from "../stores/auth-store";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "./ui/buttons/AppButton";

export function Main() {
  const [ isLoading, setIsLoading ] = React.useState<boolean>(true);

  const navigate = useNavigate();

  React.useEffect(() => {
    (async () => {
      try {
        const authStore = AuthStore.getStore();
        if (authStore.accessToken) {
          setIsLoading(false);
          return;
        }

        const result = await authStore.refreshTokens();

        if (result.status === "fail") {
          return navigate("/sign_in");
        }

        authStore.setAccessToken(result.data);
        setIsLoading(false);
      } catch (err) {
        throw err;
      }
    })();
  }, [navigate]);

  const signOut = React.useCallback(async () => {
    const authStore = AuthStore.getStore();
    const result = await authStore.signOut();
    if (result.status === "success") {
      navigate("/sign_in")
    }
  }, [navigate]);

  const generateInvitationLink = React.useCallback(async () => {
    const authStore = AuthStore.getStore();
    const result = await authStore.generateInvitationLink();
    const { data } = result;
    if (data?.link_uuid) {
      console.log("link_uuid", data.link_uuid)
    } else {
      console.log("link_uuid", data?.link_uuid)
    }
  }, []);

  if (isLoading) {
    // todo FullScreenSize Loader
    return (
      <View style={styles.root}>
        <Text>...Loading</Text>
      </View>
    )
  }


  return (
    <View style={styles.root}>
      <Text>Main Page</Text>
      <AppButton onPress={signOut} title={"Sign Out"}/>
      <AppButton onPress={generateInvitationLink} title={"Generate Invitation Link"}/>
    </View>
  )
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
  }
});
