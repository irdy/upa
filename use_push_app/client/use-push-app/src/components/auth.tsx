import React from "react";
import { useNavigate } from "react-router-dom";
import { AppAuthForm, AppAuthFormValues } from "./ui/forms/app-auth-form";
import { AuthStore } from "../stores/auth-store";
import { Text, View } from "react-native";
import { styles } from "../styles/common-styles";

interface AuthProps {
  authType: "signIn" | "signUp"
}

export function Auth({ authType }: AuthProps) {
  const navigate = useNavigate();

  const onAuthFormSubmit = async (values: AppAuthFormValues) => {
    const authStore = AuthStore.getStore();
    const result = await authStore[authType]({
      body: JSON.stringify({
        payload: values
      })
    });

    authStore.setAccessToken(result.data);
    if (result.status === "success") {
      navigate("/");
    } else {
      throw new Error(`Access Token successfully installed. Expected Response status is 'success', 
      but got ${result.status}`)
    }
  }

  return (
    <View style={styles.horCenter}>
      <Text>Please, {authType === "signUp" ? "Sign Up" : "Sign In"}</Text>
      <AppAuthForm onSubmit={onAuthFormSubmit}/>
    </View>
  )
}