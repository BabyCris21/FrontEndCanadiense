import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import API from "./services/api";

export default function LoginScreen() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!correo || !password) {
      Alert.alert("Campos vacíos", "Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/usuarios/login", { correo, password });

      if (res.data.token) {
        await AsyncStorage.setItem("token", res.data.token);
        await AsyncStorage.setItem("usuario", JSON.stringify(res.data.usuario));

        const { rol } = res.data.usuario;
        if (rol === "alumno") router.push("/alumno");
        else if (rol === "docente") router.push("/docente");
        else router.push("/home");
      } else {
        Alert.alert("Error", res.data.msg || "Credenciales inválidas");
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#E0DACC" }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={{
            color: "#4A70A9", // título más oscuro
            fontSize: 32,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          Iniciar Sesión
        </Text>

        <TextInput
          placeholder="Correo"
          placeholderTextColor="#4A70A9"
          autoCapitalize="none"
          keyboardType="email-address"
          style={{
            backgroundColor: "#FFF",
            color: "#000",
            borderRadius: 10,
            padding: 15,
            marginBottom: 15,
            borderWidth: 1,
            borderColor: "#4A70A9",
          }}
          value={correo}
          onChangeText={setCorreo}
        />

        <View style={{ position: "relative", marginBottom: 20 }}>
          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#4A70A9"
            secureTextEntry={!showPassword}
            style={{
              backgroundColor: "#FFF",
              color: "#000",
              borderRadius: 10,
              padding: 15,
              paddingRight: 70,
              borderWidth: 1,
              borderColor: "#4A70A9",
            }}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", right: 15, top: 15 }}
          >
            <Text style={{ color: "#8FABD4", fontWeight: "bold" }}>
              {showPassword ? "Ocultar" : "Mostrar"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: "#4A70A9",
            padding: 15,
            borderRadius: 10,
            marginBottom: 15,
          }}
        >
          <Text
            style={{
              color: "#EFECE3",
              fontWeight: "bold",
              textAlign: "center",
              fontSize: 16,
            }}
          >
            {loading ? "Cargando..." : "Ingresar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/registro")}
          style={{ padding: 15 }}
        >
          <Text
            style={{
              color: "#4A70A9", // texto más oscuro acorde al fondo
              textAlign: "center",
              textDecorationLine: "underline",
              fontWeight: "bold",
            }}
          >
            ¿No tienes cuenta? Regístrate
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
