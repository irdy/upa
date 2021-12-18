import React from "react";
import { AppListItemClickable } from "./ui/lists/app-list";
import { Heading } from "./ui/headings/heading";
import { FlatList, View, Text } from "react-native";
import { ContactsListProps } from "./consumers/contacts-list-container";

export function _ContactsList({ contactsList }: ContactsListProps) {
  const contactSelected = React.useCallback(() => {
    console.log("selected");
  }, []);

  const renderItem = React.useCallback(({ item }) =>
    <AppListItemClickable title={item.name} onPress={contactSelected} />, [contactSelected]);

  const keyExtractor = React.useCallback((item) => item.id, []);

  return <>
    <Heading title={"Contacts"} />
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

