import './index.css';
import {AppRegistry} from "react-native";
import App from './components/app';
import { PushSubscriptionManager } from "./helpers/push-subscription-manager";

AppRegistry.registerComponent("App", () => App);

AppRegistry.runApplication("App", {
  rootTag: document.getElementById("root")
});

PushSubscriptionManager.registerServiceWorker().catch(err => { throw err });
