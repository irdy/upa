import { Button, StyleSheet, View } from "react-native";
import React, { Dispatch, SetStateAction } from "react";

// extends ButtonProps
interface AppButtonProps  {
  asyncDisable?: boolean;
  title: string | React.ReactElement;
  onPress: VoidFunction;
}

function disableOnPress(props: AppButtonProps, setDisabled: Dispatch<SetStateAction<boolean>>): AppButtonProps {
  return {
    ...props,
    onPress: async () => {
      setDisabled(true);
      await props.onPress();
      setDisabled(false);
    }
  }
}

export function AppButton({asyncDisable = false, ...rest}: AppButtonProps) {
  const [disabled, setDisabled] = React.useState(false);

  return <View style={styles.size}>
    <Button color={"slategray"} disabled={disabled} {...(asyncDisable ? disableOnPress(rest, setDisabled) : rest ) } />
  </View>
}

const styles = StyleSheet.create({
  size: {
    maxWidth: 240,
    marginBottom: 16,
  }
});
