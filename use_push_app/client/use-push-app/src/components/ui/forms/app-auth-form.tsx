import { Formik } from "formik";
import { Button, TextInput, View, Text, StyleSheet } from "react-native";
import React from "react";

export interface AppAuthFormValues {
  username: string,
  password: string
}

const initialValues: AppAuthFormValues = {
  username: '',
  password: ''
}

interface AppAuthFormProps {
  onSubmit: (values: AppAuthFormValues) => void;
}

function _AppAuthForm({ onSubmit }: AppAuthFormProps) {
  return <View style={styles.form}>
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
        <View>
          <Text>Username</Text>
          <TextInput
            style={styles.textInput}
            onChangeText={handleChange('username')}
            onBlur={handleBlur('username')}
            value={values.username}
          >
          </TextInput>
          <Text>Password</Text>
          <TextInput
            type={"password"}
            style={styles.textInput}
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            value={values.password}
          >
          </TextInput>
          <Button onPress={handleSubmit} title="Submit"/>
        </View>
      )}
    </Formik>
  </View>
}

export const AppAuthForm = React.memo(_AppAuthForm);

const styles = StyleSheet.create({
  form: {
    width: 300,
    backgroundColor: "#ddd",
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignSelf: "center"
  },
  textInput: {
    backgroundColor: "#fff",
    marginBottom: 16,
    height: 24
  }
})