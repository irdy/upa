import React from "react";
import { AppListItemClickable } from "./ui/lists/app-list";
import { Heading } from "./ui/headings/heading";
import { FlatList, View, Text } from "react-native";
import { ContactsListProps } from "./consumers/contacts-list-container";
import { Contact } from "../stores/contacts-store";
import { useNavigate } from "react-router-dom";

interface ContactItem {
  item: Contact
}

export interface PushSubscriptionNavState {
  contact_user_id: number,
  contact_name: string
}

export function _ContactsList({ contactsList }: ContactsListProps) {
  const navigate = useNavigate();

  const renderItem = React.useCallback(({ item }: ContactItem) => {
    function _contactSelected() {
      const pushSubscriptionNavState: PushSubscriptionNavState = {
        contact_user_id: item.contact_user_id,
        contact_name: item.name
      }

      navigate("/push_subscriptions", {
        state: pushSubscriptionNavState
      })
    }
    return <AppListItemClickable title={item.name} onPress={_contactSelected} />;
  }, [navigate]);

  const keyExtractor = React.useCallback((item) => item.id, []);

  return <>
    <Heading type={"h2"} title={"Contacts"} />
    <FlatList
      data={contactsList}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
    />
  </>
}

export const ContactsList = React.memo(_ContactsList);

export function ContactsListStringRepresentation({ contactsList }: ContactsListProps) {
  return <View>
    <Text>
      { JSON.stringify(contactsList, null, 4) }
    </Text>
  </View>
}

