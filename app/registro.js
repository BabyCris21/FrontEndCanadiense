import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Appearance,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import API from "./services/api";

export default function RegistroAlumno() {
  const router = useRouter();
  const colorScheme = Appearance.getColorScheme();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
  const [tempFecha, setTempFecha] = useState(new Date()); // <-- estado temporal
  const [docentes, setDocentes] = useState([]);
  const [tutor, setTutor] = useState("");
  const [grado, setGrado] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchDocentes = async () => {
      try {
        const res = await API.get("/usuarios/docentes");
        setDocentes(res.data);
      } catch (error) {
        console.log(error.response?.data || error.message || error);
      }
    };
    fetchDocentes();
  }, []);

  const handleTutorChange = (selectedId) => {
    setTutor(selectedId);
    const docente = docentes.find(d => d._id === selectedId);
    if (docente) setGrado(docente.grado);
  };

  const handleRegister = async () => {
    if (!nombre || !apellido || !correo || !dni || !password || !tutor) {
      Alert.alert("Campos vacíos", "Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/usuarios/registrar", {
        nombre,
        apellido,
        correo,
        dni,
        password,
        fechaNacimiento,
        grado,
        tutor,
      });

      Alert.alert("Éxito", res.data.msg, [
        {
          text: "OK",
          onPress: () => router.push("/"),
        }
      ]);


      setNombre(""); setApellido(""); setCorreo(""); setDni(""); setPassword("");
      setFechaNacimiento(new Date()); setTempFecha(new Date()); setGrado(""); setTutor("");
    } catch (error) {
      console.log(error.response?.data || error.message || error);
      Alert.alert("Error", "No se pudo registrar al alumno");
    } finally {
      setLoading(false);
    }
  };

  const colors = {
    light: {
      background: "#f7f7f7",
      text: "#333",
      inputBg: "#fff",
      border: "#ccc",
      button: "#007bff",
      buttonText: "#fff",
    },
    dark: {
      background: "#121212",
      text: "#e1e1e1",
      inputBg: "#1e1e1e",
      border: "#555",
      button: "#1e90ff",
      buttonText: "#fff",
    }
  };

  const theme = colorScheme === "dark" ? colors.dark : colors.light;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 40 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: theme.text }}>
          Registro de Alumno
        </Text>

        <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre}
          style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}
          placeholderTextColor={theme.text}
        />
        <TextInput placeholder="Apellido" value={apellido} onChangeText={setApellido}
          style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}
          placeholderTextColor={theme.text}
        />
        <TextInput placeholder="Correo" value={correo} onChangeText={setCorreo}
          autoCapitalize="none" keyboardType="email-address"
          style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}
          placeholderTextColor={theme.text}
        />
        <TextInput placeholder="DNI" value={dni} onChangeText={setDni}
          keyboardType="number-pad" maxLength={8}
          style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}
          placeholderTextColor={theme.text}
        />

        <View style={{ position: "relative" }}>
          <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={{ ...styles.input, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }}
            placeholderTextColor={theme.text}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 10, top: 12 }}>
            <Text style={{ color: theme.button }}>{showPassword ? "Ocultar" : "Mostrar"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => { setTempFecha(fechaNacimiento); setShowDatePicker(true); }}
          style={{ ...styles.dateButton, backgroundColor: theme.inputBg, borderColor: theme.border }}>
          <Text style={{ color: theme.text }}>Fecha de nacimiento: {fechaNacimiento.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && Platform.OS === "ios" ? (
          <View style={{
            backgroundColor: theme.background,
            padding: 10,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DateTimePicker
              value={tempFecha}
              mode="date"
              display="spinner"
              onChange={(event, selectedDate) => {
                if (selectedDate) setTempFecha(selectedDate);
              }}
              style={{ width: '100%', height: 150 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, width: '100%' }}>
              <TouchableOpacity onPress={() => { setFechaNacimiento(tempFecha); setShowDatePicker(false); }}
                style={{ flex: 1, padding: 10, marginHorizontal: 5, backgroundColor: theme.button, borderRadius: 8 }}>
                <Text style={{ color: theme.buttonText, textAlign: 'center' }}>Aceptar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}
                style={{ flex: 1, padding: 10, marginHorizontal: 5, backgroundColor: '#aaa', borderRadius: 8 }}>
                <Text style={{ color: '#fff', textAlign: 'center' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          Platform.OS === "android" && showDatePicker && (
            <DateTimePicker
              value={fechaNacimiento}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);  // cerrar el picker
                if (selectedDate) setFechaNacimiento(selectedDate); // actualizar directamente
              }}
            />
          )
        )}


        <View style={{
          borderWidth: 1,
          borderRadius: 10,
          borderColor: theme.border,
          overflow: 'hidden',
          marginBottom: 20,
          height: Platform.OS === 'ios' ? 150 : undefined
        }}>
          <Picker
            selectedValue={tutor}
            onValueChange={handleTutorChange}
            itemStyle={{ height: 150 }}
          >
            <Picker.Item label="-- Seleccionar docente --" value="" />
            {docentes.map(doc => (
              <Picker.Item key={doc._id} label={`${doc.nombre} ${doc.apellido}`} value={doc._id} />
            ))}
          </Picker>
        </View>

        <TextInput
          placeholder="Grado asignado"
          value={grado}
          editable={false}
          style={{
            ...styles.input,
            backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#e0e0e0",
            color: theme.text,
          }}
        />

        <TouchableOpacity onPress={handleRegister} disabled={loading}
          style={{ ...styles.button, backgroundColor: loading ? "#aaa" : theme.button }}>
          <Text style={{ color: theme.buttonText, textAlign: "center", fontWeight: "bold" }}>
            {loading ? "Registrando..." : "Registrar"}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 },
  picker: { borderWidth: 1, borderRadius: 10, marginBottom: 20 },
  button: { padding: 15, borderRadius: 10, marginTop: 10 },
  dateButton: { padding: 15, borderWidth: 1, borderRadius: 10, marginBottom: 20, justifyContent: "center" },
};
