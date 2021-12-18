import { Button, StyleSheet, View } from "react-native";

export function AppButton(props: any) {
  return <View style={styles.size}>
    <Button color={"slategray"} {...props } />
  </View>
}

const styles = StyleSheet.create({
  size: {
    maxWidth: 240,
    marginBottom: 16,
  }
});
