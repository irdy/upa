import React from "react";
import { Text } from "react-native";

type HeadingProps = {
  title: string;
}

function _Heading({ title }: HeadingProps) {
  return <Text>
    { title }
  </Text>
}

export const Heading = React.memo(_Heading);