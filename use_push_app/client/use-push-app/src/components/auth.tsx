import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppAuthForm, AppAuthFormValues } from "./ui/forms/app-auth-form";
import { AuthResponseData, AuthStore } from "../stores/auth-store";
import { Text, View } from "react-native";
import { layoutStyles } from "../styles/common-styles";
import { useObservable } from "../hooks/useObservable";

interface AuthValues extends AppAuthFormValues {
  link_uuid?: string;
}

interface AuthProps {
  authType: "signIn" | "signUp"
}

export function Auth({ authType }: AuthProps) {
  const authStore = AuthStore.getInstance();
  const navigate = useNavigate();

  const params = useParams();
  const { link_uuid } = params;

  const [tokenPair] = useObservable<AuthResponseData>(
    AuthStore.getInstance().getSubject<AuthResponseData>("tokenPair")
  );

  React.useEffect(() => {
    if (tokenPair) {
      navigate("/", {replace: true});
    }
  }, [navigate, tokenPair])

  const onAuthFormSubmit = async (values: AppAuthFormValues) => {
    let payload: AuthValues = values;

    if (authType === "signUp") {
      payload = { ...values, link_uuid: link_uuid }
    }

    return authStore[authType]({
      body: JSON.stringify({
        payload
      })
    });
  }

  return (
    <View style={layoutStyles.content}>
      <View style={layoutStyles.mb_16}>
        <Text>Please, {authType === "signUp" ? "Sign Up" : "Sign In"}</Text>
      </View>

      <AppAuthForm onSubmit={onAuthFormSubmit}/>
    </View>
  )
}