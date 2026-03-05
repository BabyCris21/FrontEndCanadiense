import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import API from "./services/api";

const COLORS = {
  primaryBlue: "#1E56A0",
  lightBlue: "#E1F0FF",
  white: "#FFFFFF",
  textDark: "#2D4B7A",
  textGray: "#718096",
  delete: "#EF4444",
  edit: "#F59E0B",
  progress: "#10B981",
  bgGray: "#F8FAFF",
};

export default function Docente() {
  const router = useRouter();
  const [alumnos, setAlumnos] = useState([]);
  const [alumnosFiltrados, setAlumnosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  // Estados para Modal de Edición
  const [modalVisible, setModalVisible] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [editForm, setEditForm] = useState({
    nombre: "",
    apellido: "",
    grado: "",
    dni: "",
  });

  // 1. CARGAR ALUMNOS
  const cargarAlumnos = async () => {
    try {
      const usuarioData = await AsyncStorage.getItem("usuario");
      if (!usuarioData) return;
      const usuario = JSON.parse(usuarioData);

      const res = await API.get(`/usuarios/docente/${usuario.id}/alumnos`);
      setAlumnos(res.data);
      setAlumnosFiltrados(res.data);
    } catch (error) {
      console.error("Error cargando alumnos:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAlumnos();
  }, []);

  // 2. FILTRADO EN TIEMPO REAL
  useEffect(() => {
    const filtrados = alumnos.filter(
      (a) =>
        `${a.nombre} ${a.apellido}`
          .toLowerCase()
          .includes(busqueda.toLowerCase()) || a.dni.includes(busqueda),
    );
    setAlumnosFiltrados(filtrados);
  }, [busqueda, alumnos]);

  // 3. PREPARAR EDICIÓN
  const prepararEdicion = (alumno) => {
    setAlumnoSeleccionado(alumno);
    setEditForm({
      nombre: alumno.nombre,
      apellido: alumno.apellido,
      grado: alumno.grado,
      dni: alumno.dni,
    });
    setModalVisible(true);
  };

  // 4. ACTUALIZAR
  const handleUpdate = async () => {
    const id = alumnoSeleccionado?._id;
    if (!id) return;
    try {
      const res = await API.put(`/usuarios/${id}`, editForm);
      if (res.data) {
        Alert.alert("Éxito", "Alumno actualizado");
        setModalVisible(false);
        setAlumnos((prev) =>
          prev.map((a) => (a._id === id ? { ...a, ...editForm } : a)),
        );
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar");
    }
  };

  // 5. ELIMINAR
  const confirmDelete = (id) => {
    Alert.alert("Eliminar Alumno", "¿Borrar a este alumno permanentemente?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await API.post(`/usuarios/delete`, { id });
            setAlumnos((prev) => prev.filter((a) => a._id !== id));
            Alert.alert("Eliminado", "Usuario borrado correctamente");
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar");
          }
        },
      },
    ]);
  };

  // 6. CERRAR SESIÓN (Lógica del Botón Flotante)
  const cerrarSesion = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("usuario");
          router.replace("/");
        },
      },
    ]);
  };

  if (cargando)
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
      </View>
    );

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Mis Alumnos</Text>
          <TouchableOpacity onPress={cargarAlumnos} style={styles.iconBox}>
            <Ionicons name="refresh" size={22} color={COLORS.primaryBlue} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={COLORS.textGray} />
          <TextInput
            placeholder="Buscar por nombre o DNI..."
            style={styles.searchInput}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>
      </View>

      {/* LISTA DE ALUMNOS */}
      <FlatList
        data={alumnosFiltrados}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron alumnos.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {item.nombre[0]}
                  {item.apellido[0]}
                </Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.studentName}>
                  {item.nombre} {item.apellido}
                </Text>
                <Text style={styles.studentDetail}>Grado: {item.grado}</Text>
              </View>
              <TouchableOpacity
                style={styles.progressBtn}
                onPress={() => router.push(`/progreso/${item._id}`)}
              >
                <MaterialCommunityIcons
                  name="chart-line"
                  size={24}
                  color={COLORS.progress}
                />
                <Text style={styles.progressText}>Ver</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.bodyText}>
                <Ionicons name="card-outline" /> DNI: {item.dni}
              </Text>
              <Text style={styles.bodyText}>
                <Ionicons name="mail-outline" /> {item.correo}
              </Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => prepararEdicion(item)}
              >
                <Ionicons name="pencil" size={18} color={COLORS.edit} />
                <Text style={[styles.actionBtnText, { color: COLORS.edit }]}>
                  Editar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => confirmDelete(item._id)}
              >
                <Ionicons name="trash" size={18} color={COLORS.delete} />
                <Text style={[styles.actionBtnText, { color: COLORS.delete }]}>
                  Eliminar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* BOTÓN FLOTANTE DE CIERRE DE SESIÓN */}
      <TouchableOpacity
        style={styles.fabLogout}
        onPress={cerrarSesion}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out" size={26} color="white" />
      </TouchableOpacity>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerTab}
          onPress={() => cargarAlumnos()}
        >
          <Ionicons name="people" size={24} color={COLORS.primaryBlue} />
          <Text style={[styles.footerText, { color: COLORS.primaryBlue }]}>
            Alumnos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerTab}
          onPress={() => router.push("/progreso-general")}
        >
          <MaterialCommunityIcons
            name="chart-bar"
            size={24}
            color={COLORS.textGray}
          />
          <Text style={styles.footerText}>Progreso</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerTab}
          onPress={() => router.push("/perfilDocente")}
        >
          <Ionicons
            name="person-circle-outline"
            size={24}
            color={COLORS.textGray}
          />
          <Text style={styles.footerText}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL DE EDICIÓN */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Alumno</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons
                  name="close-circle"
                  size={30}
                  color={COLORS.textGray}
                />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={editForm.nombre}
                onChangeText={(t) => setEditForm({ ...editForm, nombre: t })}
              />
              <Text style={styles.label}>Apellido</Text>
              <TextInput
                style={styles.input}
                value={editForm.apellido}
                onChangeText={(t) => setEditForm({ ...editForm, apellido: t })}
              />
              <Text style={styles.label}>Grado</Text>
              <TextInput
                style={styles.input}
                value={editForm.grado}
                onChangeText={(t) => setEditForm({ ...editForm, grado: t })}
              />
              <Text style={styles.label}>DNI</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={editForm.dni}
                onChangeText={(t) => setEditForm({ ...editForm, dni: t })}
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdate}
              >
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.bgGray },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: COLORS.primaryBlue,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: { color: "white", fontSize: 22, fontWeight: "bold" },
  iconBox: { backgroundColor: "white", padding: 8, borderRadius: 10 },
  searchContainer: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 45,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  listContent: { padding: 20, paddingBottom: 150 }, // Aumentado para que el FAB no tape el último item
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: COLORS.primaryBlue, fontWeight: "bold" },
  cardInfo: { marginLeft: 12, flex: 1 },
  studentName: { fontSize: 16, fontWeight: "bold", color: COLORS.textDark },
  studentDetail: { color: COLORS.textGray, fontSize: 13 },
  progressBtn: { alignItems: "center" },
  progressText: { fontSize: 10, color: COLORS.progress, fontWeight: "bold" },
  cardBody: {
    marginVertical: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
  },
  bodyText: { fontSize: 13, color: COLORS.textGray, marginBottom: 4 },
  cardActions: { flexDirection: "row", justifyContent: "space-around" },
  actionBtn: { flexDirection: "row", alignItems: "center" },
  actionBtnText: { marginLeft: 5, fontWeight: "600" },

  // ESTILO DEL BOTÓN FLOTANTE
  fabLogout: {
    position: "absolute",
    bottom: 95,
    right: 20,
    backgroundColor: COLORS.delete,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },

  footer: {
    flexDirection: "row",
    backgroundColor: "white",
    height: 75,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerTab: { alignItems: "center", justifyContent: "center", flex: 1 },
  footerText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textGray,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.textDark },
  label: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    backgroundColor: COLORS.bgGray,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  saveButton: {
    backgroundColor: COLORS.primaryBlue,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  emptyText: { textAlign: "center", marginTop: 50, color: COLORS.textGray },
});
