import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
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
        const { rol } = res.data.usuario;

        // Redirigir según rol
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
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
      style={{ flex: 1, justifyContent: "center", padding: 20 }}
    >
      <Text style={{ color: "white", fontSize: 32, fontWeight: "bold", textAlign: "center", marginBottom: 30 }}>
        Iniciar Sesión
      </Text>

      <TextInput
        placeholder="Correo"
        placeholderTextColor="#ddd"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          backgroundColor: "rgba(255,255,255,0.2)",
          color: "white",
          borderRadius: 10,
          padding: 15,
          marginBottom: 15,
        }}
        value={correo}
        onChangeText={setCorreo}
      />

      <View style={{ position: "relative", marginBottom: 20 }}>
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#ddd"
          secureTextEntry={!showPassword}
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "white",
            borderRadius: 10,
            padding: 15,
            paddingRight: 50,
          }}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={{ position: "absolute", right: 15, top: 15 }}
        >
          <Text style={{ color: "white" }}>{showPassword ? "Ocultar" : "Mostrar"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: "#ff6b6b",
          padding: 15,
          borderRadius: 10,
          marginBottom: 15,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
          {loading ? "Cargando..." : "Ingresar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/registro")}
        style={{ padding: 15 }}
      >
        <Text style={{ color: "white", textAlign: "center", textDecorationLine: "underline" }}>
          ¿No tienes cuenta? Regístrate
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
