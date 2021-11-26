import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppAuthForm, AppAuthFormValues } from "./ui/forms/app-auth-form";
import { AuthStore } from "../stores/auth-store";
import { Text, View } from "react-native";
import { styles } from "../styles/common-styles";

interface AuthValues extends AppAuthFormValues {
  link_uuid?: string;
}

interface AuthProps {
  authType: "signIn" | "signUp"
}

export function Auth({ authType }: AuthProps) {
  const navigate = useNavigate();
  const params = useParams();

  const { link_uuid } = params;

  const onAuthFormSubmit = async (values: AppAuthFormValues) => {
    const authStore = AuthStore.getStore();
    let payload: AuthValues = values;

    if (authType === "signUp") {
      payload = { ...values, link_uuid: link_uuid }
    }

    const result = await authStore[authType]({
      body: JSON.stringify({
        payload
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