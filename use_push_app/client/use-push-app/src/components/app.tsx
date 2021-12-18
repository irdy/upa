import React from "react";
import { View, Text } from 'react-native';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Main } from "./main";
import { styles } from "../styles/common-styles";
import { ErrorAlert } from "./error-alert";
import { Auth } from "./auth";
import { useObservable } from "../hooks/useObservable";
import { AuthResponseData, AuthStore } from "../stores/auth-store";
import { Preloader } from "./ui/other/preloader";

/* todo SafeAreaView - use with Mobile Router */

function App() {
  return <>
    <Router/>
    <ErrorAlert/>
  </>
}

function Router() {
  return (
    <View style={styles.container}>
      <BrowserRouter>
        <Routes>
          <Route element={<RequiredUserNotAuthorized />}>
            <Route path="/sign_in" element={<Auth authType={"signIn"}/>}/>
            <Route path="/sign_up/:link_uuid" element={<Auth authType={"signUp"}/>}/>
          </Route>

          <Route element={<RequiredAuth />}>
            <Route path="/" element={<Main/>}/>
            <Route path="/stub" element={<Stub/>}/>
          </Route>

          <Route path="*" element={<NotFound />}/>
        </Routes>
      </BrowserRouter>
    </View>
  )
}

const RequiredUserNotAuthorized = React.memo(function RequiredUserLoggedOut() {
  const [tokenPair] = useObservable<AuthResponseData>(
    AuthStore.getInstance().getSubject<AuthResponseData>("tokenPair")
  );

  console.log("tokenPairtokenPairtokenPair", tokenPair)

  // Auth already loaded
  if (tokenPair) {
    // todo Sign_Out Page???
    return <Navigate to="/" />;
  }

  return <Outlet />
})

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
        console.log("LOAD TOKEN PAIR");
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

  return <Outlet />;
});

const NotFound = React.memo(function NotFound() {
  return <View>
    <Text>There's nothing here! 404</Text>
  </View>
});

function Stub() {
  return <h1>Stub</h1>
}

export default App;

