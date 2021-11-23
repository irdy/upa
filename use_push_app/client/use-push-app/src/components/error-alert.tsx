import React from "react";
import { ErrorStore, IError } from "../stores/error.store";
import { useObservable } from "../hooks/useObservable";
import { View, Text } from "react-native";
import { Utils } from "../utils";

const HIDE_ERROR_MESSAGE_AFTER = 5000;

export function ErrorAlert() {
  const { errorsObservable } = ErrorStore.getStore();
  const [ currentError ] = useObservable<IError>(errorsObservable);

  const [ errors, setErrors ] = React.useState<IError[]>();

  // let counter = React.useRef(0);

  // const _onPress = () => {
  //   counter.current += 2;
  //   errorsSubject.next({
  //     message: counter.current.toString(),
  //     data: {
  //       login: "login required",
  //       password: "password required"
  //     }
  //   });
  // }

  React.useEffect(() => {
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
      await Utils.wait(HIDE_ERROR_MESSAGE_AFTER);
      setErrors(prevErrors => {
        return (prevErrors ?? []).filter((err) => err.id !== lastError.id);
      })
    })();
  }, [ errors ]);

  return <View>
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
