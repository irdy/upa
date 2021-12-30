import React from "react";
import { View, Text } from 'react-native';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Main } from "./main";
import { layoutStyles } from "../styles/common-styles";
import { ErrorAlert } from "./error-alert";
import { Auth } from "./auth";
import { useObservable } from "../hooks/useObservable";
import { AuthResponseData, AuthStore } from "../stores/auth-store";
import { Preloader } from "./ui/other/preloader";
import { PushSubscriptionsList } from "./push-subscriptions-list";
import { SendPushPage } from "./send-push-page";

/* todo SafeAreaView - use with Mobile Router */

function App() {
  return <>
    <Router />
    <ErrorAlert />
  </>
}


function Router() {
  return (
    <View>
      <BrowserRouter>
        <Routes>
          <Route path="/sign_in" element={<Auth authType={"signIn"}/>}/>
          <Route path="/sign_up/:link_uuid" element={<Auth authType={"signUp"}/>}/>

          <Route element={<RequiredAuth />}>
            <Route path="/" element={<Main/>}/>
            <Route path="/push_subscriptions" element={<PushSubscriptionsList/>}/>
            <Route path="/send_push" element={<SendPushPage />}/>
          </Route>

          <Route path="*" element={<NotFound />}/>
        </Routes>
      </BrowserRouter>
    </View>
  )
}

const RequiredAuth = React.memo(function RequiredAuth() {
  const navigate = useNavigate();
  let location = useLocation();

  const stateRef = React.useRef({ from: location });
  const authStore = AuthStore.getInstance();

  const [tokenPair] = useObservable<AuthResponseData>(
    AuthStore.getInstance().getSubject<AuthResponseData>("tokenPair")
  );

  React.useEffect(() => {
    if (tokenPair === undefined) {
      authStore.refreshTokens().finally();
    }
  }, [authStore, navigate, tokenPair]);

  // `undefined` means Data not loaded (Initial Value of Behaviour Subject)
  if (tokenPair === undefined) {
    return <Preloader />
  }

  // `null` means nullable Data loaded (Next Value of Behaviour Subject)
  if (tokenPair === null) {
    return <Navigate to="/sign_in" state={stateRef.current} />;
  }

  return <View>
    <View style={layoutStyles.page}>
      <Outlet />
    </View>
  </View>
});

const NotFound = React.memo(function NotFound() {
  return <View>
    <Text>There's nothing here! 404</Text>
  </View>
});

export default App;

