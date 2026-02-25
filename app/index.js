import { Ionicons } from "@expo/vector-icons"; // Para los iconos de sobre y candado
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import API from "./services/api";

const COLORS = {
  primaryBlue: "#4A80D6",
  darkBlue: "#2E528F",
  inputBg: "#FFFFFF",
  textGray: "#8E9AAF",
  border: "#E2E8F0",
  white: "#FFFFFF",
};

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
      }
    } catch (error) {
      Alert.alert("Error", "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        bounces={false}
      >
        {/* Cabecera con Ilustración */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image
              source={{ uri: "https://placeholder_para_el_personaje" }} // Reemplaza con tu asset local
              style={styles.avatar}
            />
            <View>
              <Text style={styles.welcomeText}>Bienvenido</Text>
              <Text style={styles.subWelcomeText}>
                Inicia sesión para continuar
              </Text>
            </View>
          </View>
          <View style={styles.curveOverlay} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.loginTitle}>Iniciar Sesión</Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#A0AEC0"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#A0AEC0"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Input Password */}
          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#A0AEC0"
              style={styles.icon}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor="#A0AEC0"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.showText}>Mostrar</Text>
            </TouchableOpacity>
          </View>

          {/* Botón Ingresar */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Cargando..." : "Ingresar"}
            </Text>
          </TouchableOpacity>

          {/* Registro */}
          <View style={styles.footerLinks}>
            <View style={styles.divider} />
            <Text style={styles.noAccountText}>¿No tienes cuenta?</Text>
            <TouchableOpacity onPress={() => router.push("/registro")}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: "#E1F0FF",
    height: 220,
    justifyContent: "center",
    paddingHorizontal: 30,
    position: "relative",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  avatar: {
    width: 100,
    height: 100,
    marginRight: 15,
    resizeMode: "contain",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2D4B7A",
  },
  subWelcomeText: {
    fontSize: 16,
    color: "#5B789E",
    width: 140,
  },
  curveOverlay: {
    position: "absolute",
    bottom: -30,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingTop: 10,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2D4B7A",
    textAlign: "center",
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 20,
    // Sombra suave
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2D3748",
  },
  showText: {
    color: "#718096",
    fontWeight: "600",
    backgroundColor: "#EDF2F7",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 12,
  },
  loginButton: {
    backgroundColor: "#4A80D6",
    borderRadius: 12,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#4A80D6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  footerLinks: {
    marginTop: 30,
    alignItems: "center",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#F0F4F8",
    marginBottom: 15,
  },
  noAccountText: {
    color: "#718096",
    fontSize: 15,
  },
  registerLink: {
    color: "#2D4B7A",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
});
