import React from "react";
import { StyleSheet, Text } from "react-native";

type HeadingProps = {
  title: string,
  type?: "h1" | "h2" | "h3",
}

function _Heading({ title, type = "h1" }: HeadingProps) {
  return <Text style={styles[type]}>
    { title }
  </Text>
}

export const Heading = React.memo(_Heading);

const styles = StyleSheet.create({
  h1: {
    fontSize: 32
  },
  h2: {
    fontSize: 24
  },
  h3: {
    fontSize: 18
  }
});
