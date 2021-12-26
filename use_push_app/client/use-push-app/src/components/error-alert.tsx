import React from "react";
import { ErrorStore, IError } from "../stores/error.store";
import { useObservable } from "../hooks/useObservable";
import { View, Text } from "react-native";
import { Utils } from "../utils";
import { AppButton } from "./ui/buttons/app-button";

const HIDE_ERROR_MESSAGE_TIMEOUT = 5000;

export function ErrorAlert() {
  const errorStore = ErrorStore.getInstance();
  const [ currentError ] = useObservable(errorStore.getSubject<IError>("error"));

  const [ errors, setErrors ] = React.useState<IError[]>();

  const _onPress = () => {
    const errorData = {
      message: null,
      data: {
        login: "login required",
        password: "password required"
      }
    }

    ErrorStore.emitError(errorData);
  }

  // todo replace with Observable
  React.useEffect(() => {
    // only last 3 errors
    setErrors(prevErrors => {
      return (prevErrors ?? []).concat(currentError ?? []).slice(-3)
    });
  }, [ currentError ]);

  React.useEffect(() => {
    if (!errors || errors.length === 0) {
      // console.log("Queue is empty");
      return;
    }

    const lastError = errors[errors.length - 1]; // currentError in fact

    (async () => {
      await Utils.wait(HIDE_ERROR_MESSAGE_TIMEOUT);
      setErrors(prevErrors => {
        return (prevErrors ?? []).filter((err) => err.id !== lastError.id);
      })
    })();
  }, [ errors ]);

  return <View>
    {/*<AppButton onPress={_onPress} title="GenError" />*/}
    <View>
      {
        errors?.map((errorData, index) => (
          <Text key={index}>
            {JSON.stringify(errorData.error, null, 2)}
          </Text>
        ))
      }
    </View>
  </View>
}
