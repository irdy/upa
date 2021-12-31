import { ErrorMessage, Formik } from "formik";
import { TextInput, View, Text, StyleSheet } from "react-native";
import React from "react";
import { AppButton } from "../buttons/app-button";
import * as Yup from 'yup';
import { layoutStyles } from "../../../styles/common-styles";

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

const AppAuthSchema = Yup.object().shape({
  username: Yup.string()
    .min(6, 'Too short username')
    .max(30, 'Too long username!')
    .required('Username is required!'),

  password: Yup.string()
    .min(6, 'Too short password')
    .max(30, 'Too long password')
    .required('Password is required!'),
});

function _AppAuthForm({onSubmit}: AppAuthFormProps) {
  return <View style={formStyles.form}>
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={AppAuthSchema}
    >
      {({handleChange, handleBlur, handleSubmit, values, errors}) => (
        <View>
          <View style={layoutStyles.mb_16}>
            <View style={layoutStyles.mb_4}>
              <Text>Username</Text>
            </View>
            <View style={layoutStyles.mb_4}>
              <TextInput
                name={"username"}
                style={formStyles.textInput}
                onChangeText={handleChange('username')}
                onBlur={handleBlur('username')}
                value={values.username}
              >
              </TextInput>
            </View>
            <ErrorMessage component={"div"} className={"error-message"} name={"username"}/>
          </View>
          <View style={layoutStyles.mb_16}>
            <View style={layoutStyles.mb_4}>
              <Text>Password</Text>
            </View>
            <View style={layoutStyles.mb_4}>
              <TextInput
                name="password"
                type={"password"}
                style={formStyles.textInput}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
              >
              </TextInput>
            </View>
            <ErrorMessage component={"div"} className={"error-message"} name={"password"}/>
          </View>
          <AppButton fullWidth onPress={handleSubmit} title="Submit"/>
        </View>
      )}
    </Formik>
  </View>
}

export const AppAuthForm = React.memo(_AppAuthForm);

export const formStyles = StyleSheet.create({
  form: {
    width: 300,
    backgroundColor: "#ddd",
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignSelf: "center"
  },
  textInput: {
    backgroundColor: "#fff",
    height: 24
  }
})