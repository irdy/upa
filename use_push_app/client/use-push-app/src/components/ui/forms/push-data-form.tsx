import React from "react";
import { Field, Formik, ErrorMessage } from "formik";
import { Text, View, TextInput } from "react-native";
import { formStyles } from "./app-auth-form";
import { AppButton } from "../buttons/app-button";
import { layoutStyles } from "../../../styles/common-styles";
import * as Yup from 'yup';

export interface PushDataFormValues {
  message_body: string
}

const initialValues: PushDataFormValues = {
  message_body: ""
}

interface PushDataFormProps {
  onSubmit: (values: PushDataFormValues) => void;
}

const PushDataSchema = Yup.object().shape({
  message_body: Yup.string()
    .min(2, 'Message too short!')
    .max(150, 'Message too long!')
    .required('Message is required!'),
});

console.log("PushDataSchema", PushDataSchema)

export const PushDataForm = React.memo(function PushDataForm({onSubmit}: PushDataFormProps) {
  return (
    <View style={formStyles.form}>
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={PushDataSchema}
      >
        {({isSubmitting, handleBlur, handleSubmit, values}) => {
          return (
            <View>
              <View style={layoutStyles.mb_4}>
                <Text>Message</Text>
              </View>
              <View style={layoutStyles.mb_16}>
                <View style={layoutStyles.mb_4}>
                  <Field
                    id="push-message-data"
                    component="textarea"
                    rows="4"
                    name="message_body"
                    /*onChangeText={handleChange('body')}*/
                    onBlur={handleBlur('message_body')}
                    value={values.message_body}
                  />
                </View>
                <ErrorMessage component="div" className={"error-message"} name={"message_body"} />
              </View>
              {/*<TextInput*/}
              {/*  style={formStyles.textInput}*/}
              {/*  onChangeText={handleChange('body')}*/}
              {/*  onBlur={handleBlur('body')}*/}
              {/*  value={values.body}*/}
              {/*>*/}
              {/*</TextInput>*/}
              <AppButton disabled={isSubmitting} fullWidth onPress={handleSubmit} title="Submit"/>
            </View>
          )
        }}
      </Formik>
    </View>
  )
});


