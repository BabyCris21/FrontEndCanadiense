import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
  primaryBlue: "#3B82F6",
  darkBlue: "#2D4B7A",
  textGray: "#718096",
  white: "#FFFFFF",
  bgLight: "#F8FAFF",
  border: "#EDF2F7",
};

export default function RegistroAlumno() {
  const router = useRouter();

  // --- TUS ESTADOS ORIGINALES ---
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
  const [tempFecha, setTempFecha] = useState(new Date());
  const [docentes, setDocentes] = useState([]);
  const [tutor, setTutor] = useState("");
  const [grado, setGrado] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- TU LÓGICA DE DOCENTES ---
  useEffect(() => {
    const fetchDocentes = async () => {
      try {
        const res = await API.get("/usuarios/docentes");
        setDocentes(res.data);
      } catch (error) {
        console.log("Error cargando docentes:", error);
      }
    };
    fetchDocentes();
  }, []);

  const handleTutorChange = (selectedId) => {
    setTutor(selectedId);
    const docente = docentes.find((d) => d._id === selectedId);
    if (docente) setGrado(docente.grado);
  };

  // --- TU FUNCIÓN DE REGISTRO ---
  const handleRegister = async () => {
    if (!nombre || !apellido || !correo || !dni || !password || !tutor) {
      Alert.alert("Campos incompletos", "Por favor completa todos los campos");
      return;
    }
    setLoading(true);
    try {
      await API.post("/usuarios/registrar", {
        nombre,
        apellido,
        correo,
        dni,
        password,
        fechaNacimiento,
        grado,
        tutor,
      });
      Alert.alert("Registro exitoso", "Alumno registrado correctamente", [
        { text: "Aceptar", onPress: () => router.replace("/") },
      ]);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.msg || "No se pudo registrar");
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
        {/* Cabecera idéntica a la imagen */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.darkBlue} />
          </TouchableOpacity>
          <Image
            source={{
              uri: "https://img.freepik.com/vector-gratis/cuaderno-abierto-lapiz-estilo-dibujos-animados_1308-100201.jpg",
            }}
            style={styles.headerImage}
          />
          <View style={styles.curveOverlay} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Registro</Text>
          <Text style={styles.subtitle}>
            Completa tus datos para crear una cuenta
          </Text>

          {/* Nombre y Apellido */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons
                name="person-outline"
                size={18}
                color={COLORS.darkBlue}
              />
              <Text style={styles.label}>Nombres y Apellidos</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Nombres"
                value={nombre}
                onChangeText={setNombre}
              />
            </View>
            <View style={[styles.inputWrapper, { marginTop: 10 }]}>
              <TextInput
                style={styles.input}
                placeholder="Apellidos"
                value={apellido}
                onChangeText={setApellido}
              />
            </View>
          </View>

          {/* Correo y DNI */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="mail-outline" size={18} color={COLORS.darkBlue} />
              <Text style={styles.label}>Datos de contacto</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={[styles.inputWrapper, { marginTop: 10 }]}>
              <TextInput
                style={styles.input}
                placeholder="DNI (8 dígitos)"
                value={dni}
                onChangeText={setDni}
                keyboardType="number-pad"
                maxLength={8}
              />
            </View>
          </View>

          {/* Password con botón Mostrar */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={COLORS.darkBlue}
              />
              <Text style={styles.label}>Contraseña</Text>
            </View>
            <View
              style={[
                styles.inputWrapper,
                { flexDirection: "row", alignItems: "center" },
              ]}
            >
              <TextInput
                style={{ flex: 1 }}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.showBtn}
              >
                <Text style={styles.showBtnText}>
                  {showPassword ? "Ocultar" : "Mostrar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Fecha de Nacimiento */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={COLORS.darkBlue}
              />
              <Text style={styles.label}>Fecha de nacimiento</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.inputWrapper}
            >
              <Text style={{ color: COLORS.darkBlue }}>
                {fechaNacimiento.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selector de Docente y Grado */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <FontAwesome5
                name="chalkboard-teacher"
                size={16}
                color={COLORS.darkBlue}
              />
              <Text style={styles.label}>Asignación</Text>
            </View>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={tutor} onValueChange={handleTutorChange}>
                <Picker.Item label="-- Seleccionar docente --" value="" />
                {docentes.map((doc) => (
                  <Picker.Item
                    key={doc._id}
                    label={`${doc.nombre} ${doc.apellido}`}
                    value={doc._id}
                  />
                ))}
              </Picker>
            </View>
            <View
              style={[
                styles.inputWrapper,
                { marginTop: 10, backgroundColor: "#F1F5F9" },
              ]}
            >
              <Text style={{ color: COLORS.textGray }}>
                Grado: {grado || "No asignado"}
              </Text>
            </View>
          </View>

          {/* Botón Registrar */}
          <TouchableOpacity
            style={styles.mainButton}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.mainButtonText}>
              {loading ? "Registrando..." : "Crear cuenta"}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
            <TouchableOpacity onPress={() => router.push("/")}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DatePicker Modals (Android/iOS) */}
        {showDatePicker && (
          <DateTimePicker
            value={fechaNacimiento}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setFechaNacimiento(date);
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContainer: { flexGrow: 1 },
  header: {
    backgroundColor: "#E1F0FF",
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  headerImage: { width: 120, height: 120, resizeMode: "contain" },
  backButton: { position: "absolute", top: 20, left: 20, zIndex: 10 },
  curveOverlay: {
    position: "absolute",
    bottom: -1,
    width: "100%",
    height: 30,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  formContainer: { paddingHorizontal: 25 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.darkBlue,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: "center",
    marginBottom: 20,
  },
  inputGroup: { marginBottom: 15 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    marginLeft: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textGray,
    marginLeft: 8,
  },
  inputWrapper: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    justifyContent: "center",
  },
  input: { fontSize: 15, color: COLORS.darkBlue },
  pickerWrapper: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
  },
  showBtn: {
    backgroundColor: "#EDF2F7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  showBtnText: { fontSize: 11, color: COLORS.textGray, fontWeight: "700" },
  mainButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 15,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 4,
  },
  mainButtonText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  footer: { marginTop: 20, alignItems: "center", paddingBottom: 30 },
  footerText: { color: COLORS.textGray },
  loginLink: {
    color: COLORS.darkBlue,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 5,
  },
});
