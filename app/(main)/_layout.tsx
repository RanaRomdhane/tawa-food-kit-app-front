import { Stack } from 'expo-router';
import React from 'react';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="search" />
      <Stack.Screen name="product/[id]" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="order-success" />
      <Stack.Screen name="track-order" />
      <Stack.Screen name="my-orders" />
      <Stack.Screen name="my-address" />
      <Stack.Screen name="add-address" />
      <Stack.Screen name="courier-call" />
      <Stack.Screen name="courier-chat" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
