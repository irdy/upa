import { useObservable } from "./hooks/useObservable";
import { UserData, UserStore } from "./stores/user-store";
import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthStore } from "./stores/auth-store";
import { AppButton } from "./components/ui/buttons/app-button";

export function Header() {
  const navigate = useNavigate();

  const [userData] = useObservable<UserData>(UserStore.getInstance().getSubject("userData"));

  const signOut = React.useCallback(async () => {
    const authStore = AuthStore.getInstance();
    const result = await authStore.signOut();
    if (result.status === "success") {
      navigate("/sign_in");
    }
  }, [navigate]);

  return <View style={styles.header}>
    {userData && <Text>Hello, {userData.username}</Text>}
    <AppButton onPress={signOut} title={"Sign Out"}/>
  </View>
}

export const styles = StyleSheet.create({
  header: {
    color: "#fff",
    minHeight: 72,
    backgroundColor: "#bbaacc",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center"
  },
});