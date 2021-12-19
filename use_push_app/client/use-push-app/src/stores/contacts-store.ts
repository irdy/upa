import { getStore } from "./store";
import { api } from "./api.service";
import { Utils } from "../utils";

export interface Contact {
  id: number;
  name: string;
}

interface ContactData {
  contacts: Contact[];
}

type ContactsStoreSubjectNames = "contacts";

const Store = getStore<ContactsStoreSubjectNames>();

export class ContactsStore extends Store {

  @Store.withSubject<Contact[]>("contacts")
  async loadContacts(user_id: number): Promise<Contact[]> {
    const resp = await api.call<ContactData>(`/api/users/${user_id}/contacts`, {
      method: "GET"
    });

    return Utils.checkDataExist(resp.data).contacts;
  }
}


