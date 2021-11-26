import { View, Text } from 'react-native';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import React from "react";
import { Main } from "./main";
import { styles } from "../styles/common-styles";
import { ErrorAlert } from "./error-alert";
import { Auth } from "./auth";

function App() {
  return (
    <View style={styles.container}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main/>}/>
          <Route path="/sign_in" element={<Auth authType={"signIn"} />}/>
          <Route path="/sign_up/:link_uuid" element={<Auth authType={"signUp"} />}/>
          <Route
            path="*"
            element={
              <View>
                <Text>There's nothing here! 404</Text>
              </View>
            }
          />
        </Routes>
      </BrowserRouter>
      <ErrorAlert />
    </View>
  );
}

export default App;

