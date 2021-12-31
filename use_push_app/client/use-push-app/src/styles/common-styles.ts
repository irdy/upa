import { StyleSheet } from "react-native";

export const layoutStyles = StyleSheet.create({
  page: {
    justifyContent: "center",
    /*minWidth: 480,*/
    width: "100%",
    flex: 1,
  },
  content: {
    marginVertical: 16,
    marginHorizontal: 32,
  },
  root: {
    flex: 1,
  },
  horCenter: {
    justifyContent: "center"
  },
  mb_16: {
    marginBottom: 16,
  },
  mb_4: {
    marginBottom: 4,
  }
});

export const colorStyles = StyleSheet.create({
  warning: {
    color: "firebrick"
  },
  error: {
    color: "maroon"
  },
  main: {
    color: "#bbaacc"
  }
})
