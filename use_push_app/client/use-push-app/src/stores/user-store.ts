import { getStore } from "./store";

export interface UserData {
  id: number,
  username: string,
}

// second value - server data key
export const userDataMapper: Map<keyof UserData, string> = new Map([
  ["id", "user_id"],
  ["username", "user_name"]
]);

type UserStoreSubjectNames = "userData";

const Store = getStore<UserStoreSubjectNames>();

export class UserStore extends Store {

  @Store.withSubject<UserData>("userData")
  setUserData(data: UserData): UserData {
    return data;
  }

  getUserData(): UserData {
    return UserStore.getInstance().getSubject<UserData>("userData").getValue();
  }

}
