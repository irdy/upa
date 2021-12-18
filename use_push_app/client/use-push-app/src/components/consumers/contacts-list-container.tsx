import React, { ReactElement } from "react";
import { Contact, ContactsStore } from "../../stores/contacts-store";
import { useObservable } from "../../hooks/useObservable";
import { Preloader } from "../ui/other/preloader";
import { ContactsList, ContactsListStringRepresentation } from "../contacts-list";

export type ContactsListProps = {
  contactsList: Contact[];
}

type renderContactList = (props: ContactsListProps) => ReactElement<ContactsListProps>;
type ContactsListsNames = "DEFAULT_LIST" | "STRING_REPRESENTATION_LIST";

const ContactsListsCollection: Record<ContactsListsNames, renderContactList> = {
  DEFAULT_LIST: (props) => <ContactsList {...props}/>,
  STRING_REPRESENTATION_LIST: (props) => <ContactsListStringRepresentation {...props}/>
}

type ContactsListContainerProps = {
  contactListName: ContactsListsNames;
  userId?: number;
}

function _ContactsListContainer({ userId, contactListName }: ContactsListContainerProps) {
  const contactsStore = ContactsStore.getInstance();

  const [contactsList] = useObservable<Contact[]>(contactsStore.getSubject<Contact[]>("contacts"));

  React.useEffect(() => {
    if (userId === undefined) return;
    ContactsStore.getInstance().loadContacts(userId).finally();
  }, [userId]);

  if (contactsList === undefined) {
    return <Preloader />
  }

  const ContactsListComponent = ContactsListsCollection[contactListName];

  return <ContactsListComponent contactsList={contactsList} />
}

export const ContactsListContainer = React.memo(_ContactsListContainer);
