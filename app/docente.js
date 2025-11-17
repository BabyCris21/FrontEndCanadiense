import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Appearance,
  FlatList,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import API from "./services/api";

export default function DocenteScreen() {
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Detecta modo oscuro o claro
  const colorScheme = Appearance.getColorScheme();

  const colors = {
    light: {
      background: "#f7f7f7",
      text: "#333",
      cardBg: "#fff",
      border: "#ccc",
      spinner: "#007bff",
    },
    dark: {
      background: "#121212",
      text: "#e1e1e1",
      cardBg: "#1e1e1e",
      border: "#444",
      spinner: "#1e90ff",
    },
  };

  const theme = colorScheme === "dark" ? colors.dark : colors.light;

  useEffect(() => {
    const cargarAlumnos = async () => {
      try {
        const usuarioData = await AsyncStorage.getItem("usuario");
        const usuario = JSON.parse(usuarioData);

        const res = await API.get(`/usuarios/docente/${usuario.id}/alumnos`);
        setAlumnos(res.data);
      } catch (error) {
        console.log("Error cargando alumnos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarAlumnos();
  }, []);

  if (cargando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.spinner} />
        <Text style={{ marginTop: 10, color: theme.text }}>
          Cargando alumnos...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "bold",
            marginBottom: 20,
            color: theme.text,
            textAlign: "center",
          }}
        >
          Mis alumnos 👨‍🏫
        </Text>

        {alumnos.length === 0 ? (
          <Text style={{ color: theme.text, textAlign: "center" }}>
            No tienes alumnos asignados.
          </Text>
        ) : (
          <FlatList
            data={alumnos}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View
                style={{
                  padding: 15,
                  backgroundColor: theme.cardBg,
                  marginBottom: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: theme.text,
                  }}
                >
                  {item.nombre} {item.apellido}
                </Text>

                <Text style={{ color: theme.text }}>Grado: {item.grado}</Text>
                <Text style={{ color: theme.text }}>Correo: {item.correo}</Text>
                <Text style={{ color: theme.text }}>DNI: {item.dni}</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
