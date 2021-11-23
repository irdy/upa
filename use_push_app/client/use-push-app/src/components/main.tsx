import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthStore } from "../stores/auth-store";
import { StyleSheet, Text, View } from "react-native";

export function Main() {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const navigate = useNavigate();

  React.useEffect(() => {
    (async () => {
      try {
        const authStore = AuthStore.getStore();
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
    </View>
  )
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
  }
});
