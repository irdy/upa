import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

type TextButtonProps = {
  title: string;
  onPress: VoidFunction;
}

function _TextButton({ onPress, title }: TextButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
    >
      <Text>{ title }</Text>
    </TouchableOpacity>
  )
}

export const TextButton = React.memo(_TextButton);

// todo interface for button props?
const styles = StyleSheet.create({
  button: {
    display: "inline-flex",
    alignItems: "center",
    padding: 10,
  }
});

