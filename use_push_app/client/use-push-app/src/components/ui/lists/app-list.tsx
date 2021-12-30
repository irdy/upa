import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { TextButton } from "../buttons/text-button";

interface AppListItemProps {
  title: string;
}

interface AppListItemClickableProps extends AppListItemProps {
  onPress: VoidFunction; // todo optional onPress? default return id?
}

function _AppListItem({ title }: AppListItemProps) {
  return (
    <View style={styles.item}>
      <Text>{title}</Text>
    </View>
  )
}

function _AppListItemClickable({ title, onPress }: AppListItemClickableProps) {
  return (
    <TextButton title={title} onPress={onPress} />
  )
}

export const AppListItem = React.memo(_AppListItem);
export const AppListItemClickable = React.memo(_AppListItemClickable);

// extraStyle?
const styles = StyleSheet.create({
  item: {
    display: "inline-flex",
    alignItems: "center",
    //backgroundColor: "#ddd",
    padding: 10
  },
  title: {

  }
});