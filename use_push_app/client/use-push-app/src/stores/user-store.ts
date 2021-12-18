import { getStore } from "./store";

interface UserData {
  id: number,
  username: string,
  created_at: Date, // ?? Moment / Intl
  updated_at: Date
}

type UserStoreSubjectNames = "userData";

const Store = getStore<UserStoreSubjectNames>();

export class UserStore extends Store {

  name = "UserStoreName";

  @Store.withSubject<UserData>("userData")
  setUserData(data: UserData): UserData {
    console.log("Name", this.name);
    return data;
  }

  // init subject
  @Store.withSubject<UserData>("userData")
  async _setUserData(data: UserData): Promise<UserData> {
    console.log("Name", this.name);
    return data;
  }

}

const userData = {
  id: 1,
  username: "qwe",
  created_at: new Date(),
  updated_at: new Date()
}

UserStore.getInstance().setUserData(userData);
UserStore.getInstance()._setUserData({...userData, id: 2}).finally();

