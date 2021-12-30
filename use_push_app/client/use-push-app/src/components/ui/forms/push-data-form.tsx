import React from "react";
import { Field, Formik } from "formik";
import { Text, View, TextInput } from "react-native";
import { formStyles } from "./app-auth-form";
import { AppButton } from "../buttons/app-button";

export interface PushDataFormValues {
  message_body: string
}

const initialValues: PushDataFormValues = {
  message_body: ""
}

interface PushDataFormProps {
  onSubmit: (values: PushDataFormValues) => void;
}

export const PushDataForm = React.memo(function PushDataForm({onSubmit}: PushDataFormProps) {
  return (
    <View style={formStyles.form}>
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
      >
        {({handleChange, handleBlur, handleSubmit, values, errors}) => (
          <View>
            <Text>Message</Text>
            <Field
              component="textarea"
              rows="4"
              name="message_body"
              /*onChangeText={handleChange('body')}*/
              onBlur={handleBlur('message_body')}
              value={values.message_body}
            />
            {/*<TextInput*/}
            {/*  style={formStyles.textInput}*/}
            {/*  onChangeText={handleChange('body')}*/}
            {/*  onBlur={handleBlur('body')}*/}
            {/*  value={values.body}*/}
            {/*>*/}
            {/*</TextInput>*/}
            <AppButton onPress={handleSubmit} title="Submit"/>
          </View>
        )}
      </Formik>
    </View>
  )
});


