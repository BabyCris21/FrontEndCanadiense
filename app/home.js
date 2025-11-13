import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Bienvenido 👋</Text>
      <TouchableOpacity onPress={() => router.push("/")} style={{ marginTop: 20 }}>
        <Text style={{ color: "blue" }}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
