import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import MapaMentalGrafico from "../../../components/MapaMentalGrafico";
import MapaMentalZoom from "../../../components/MapaMentalZoom";

const BASE_URL = "http://192.168.18.40:5000";

const colors = {
  background: "#EFECE3",
  card: "#fff",
  title: "#4A70A9",
  subtitle: "#4A70A9",
  inputBg: "#fff",
  inputText: "#000",
  button: "#8FABD4",
  buttonText: "#000",
  delete: "#E53935",
  save: "#4A70A9",
  edit: "#FFA500",
  fullscreenBg: "#000",
  closeBtn: "#E53935",
};

export default function MapaMental() {
  const [usuarioId, setUsuarioId] = useState(null);
  const [enfoqueId, setEnfoqueId] = useState(null);
  const [mapas, setMapas] = useState([]);
  const [verMapaPreview, setVerMapaPreview] = useState(null);

  // Formulario
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editarMapaId, setEditarMapaId] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [nodos, setNodos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const user = JSON.parse(await AsyncStorage.getItem("usuario"));
        if (!user?.id) return;

        setUsuarioId(user.id);

        const rEnfoque = await fetch(
          `${BASE_URL}/api/alumno-enfoque/${user.id}`
        );
        const jEnfoque = await rEnfoque.json();
        if (jEnfoque?.enfoqueId?._id) setEnfoqueId(jEnfoque.enfoqueId._id);

        const rMapas = await fetch(
          `${BASE_URL}/api/actividades/mapa-mental/usuario/${user.id}`
        );
        const jMapas = await rMapas.json();
        setMapas(jMapas || []);
      } catch (error) {
        console.log("INIT ERROR", error);
      }
    };
    init();
  }, []);

  const agregarNodo = () =>
    setNodos((prev) => [...prev, { titulo: "", descripcion: "" }]);
  const actualizarNodo = (index, campo, valor) => {
    const copia = [...nodos];
    copia[index][campo] = valor;
    setNodos(copia);
  };
  const eliminarNodo = (index) =>
    setNodos((prev) => prev.filter((_, i) => i !== index));

  const guardarMapaMental = async () => {
    if (!titulo.trim() || nodos.length === 0) {
      Alert.alert("Error", "Agrega un título y al menos un nodo");
      return;
    }
    if (!usuarioId || !enfoqueId) {
      Alert.alert("Error", "Usuario o enfoque no cargado");
      return;
    }

    setLoading(true);
    try {
      let actividadId = editarMapaId;

      if (!editarMapaId) {
        const resAct = await fetch(`${BASE_URL}/api/actividades`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuarioId,
            enfoqueId,
            tipo: "mapa-mental",
            titulo,
            descripcion,
          }),
        });

        const act = await resAct.json();
        if (!act?.actividad?._id) throw new Error("No se creó la actividad");
        actividadId = act.actividad._id;

        await fetch(`${BASE_URL}/api/actividades/${actividadId}/mapa-mental`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodos }),
        });

        setMapas((prev) => [{ ...act.actividad, nodos }, ...prev]);
      } else {
        await fetch(`${BASE_URL}/api/actividades/${actividadId}/mapa-mental`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ titulo, descripcion, nodos }),
        });

        setMapas((prev) => {
          const sinDuplicados = prev.filter((m) => m._id !== actividadId);
          return [
            { _id: actividadId, titulo, descripcion, nodos },
            ...sinDuplicados,
          ];
        });
      }

      Alert.alert("✔", "Mapa mental guardado correctamente");
      setTitulo("");
      setDescripcion("");
      setNodos([]);
      setEditarMapaId(null);
      setMostrarFormulario(false);
    } catch (error) {
      console.error("ERROR GUARDAR MAPA", error);
      Alert.alert("Error", "No se pudo guardar el mapa mental");
    } finally {
      setLoading(false);
    }
  };

  const eliminarMapa = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/actividades/${id}/mapa-mental`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("No se pudo eliminar");
      setMapas((prev) => prev.filter((m) => m._id !== id));
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo eliminar el mapa mental");
    }
  };

  const editarMapa = (mapa) => {
    setEditarMapaId(mapa._id);
    setTitulo(mapa.titulo);
    setDescripcion(mapa.descripcion || "");
    setNodos(mapa.nodos || []);
    setMostrarFormulario(true);
  };

  const verMapa = (mapa) => setVerMapaPreview(mapa);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 50,
          paddingTop: 60,
        }}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: "bold",
            color: colors.title,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          🧠 Mis Mapas Mentales
        </Text>

        {mapas.map((mapa) => (
          <View
            key={mapa._id}
            style={{
              backgroundColor: colors.card,
              padding: 15,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 3,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: colors.title,
                }}
              >
                {mapa.titulo}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={() => editarMapa(mapa)}
                  style={{ marginHorizontal: 5 }}
                >
                  <Text style={{ color: colors.edit, fontWeight: "bold" }}>
                    ✏️
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => eliminarMapa(mapa._id)}
                  style={{ marginHorizontal: 5 }}
                >
                  <Text style={{ color: colors.delete, fontWeight: "bold" }}>
                    🗑️
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={() => verMapa(mapa)}>
              <Text style={{ color: colors.button, marginTop: 8 }}>👁 Ver</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={{
            backgroundColor: colors.button,
            padding: 15,
            borderRadius: 10,
            alignItems: "center",
            marginTop: 10,
          }}
          onPress={() => {
            setMostrarFormulario(true);
            setEditarMapaId(null);
            setTitulo("");
            setDescripcion("");
            setNodos([]);
          }}
        >
          <Text style={{ color: colors.buttonText }}>➕ Crear Nuevo Mapa</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={mostrarFormulario} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={{
            flex: 1,
            paddingTop: 50,
            paddingBottom: 50,
            paddingHorizontal: 20,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{
              backgroundColor: colors.background,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <TextInput
              placeholder="Título principal"
              value={titulo}
              onChangeText={setTitulo}
              style={{
                backgroundColor: colors.inputBg,
                color: colors.inputText,
                padding: 12,
                borderRadius: 8,
                marginBottom: 10,
              }}
              placeholderTextColor={colors.inputText}
            />
            <TextInput
              placeholder="Descripción (opcional)"
              value={descripcion}
              onChangeText={setDescripcion}
              style={{
                backgroundColor: colors.inputBg,
                color: colors.inputText,
                padding: 12,
                borderRadius: 8,
                marginBottom: 10,
              }}
              placeholderTextColor={colors.inputText}
            />
            <Text
              style={{
                fontWeight: "bold",
                color: colors.subtitle,
                marginBottom: 10,
              }}
            >
              Nodos
            </Text>
            {nodos.map((nodo, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: colors.card,
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              >
                <TextInput
                  placeholder="Subtítulo"
                  value={nodo.titulo}
                  onChangeText={(v) => actualizarNodo(index, "titulo", v)}
                  style={{
                    backgroundColor: colors.inputBg,
                    color: colors.inputText,
                    padding: 10,
                    borderRadius: 6,
                    marginBottom: 5,
                  }}
                  placeholderTextColor={colors.inputText}
                />
                <TextInput
                  placeholder="Información"
                  value={nodo.descripcion}
                  onChangeText={(v) => actualizarNodo(index, "descripcion", v)}
                  style={{
                    backgroundColor: colors.inputBg,
                    color: colors.inputText,
                    padding: 10,
                    borderRadius: 6,
                    marginBottom: 5,
                  }}
                  placeholderTextColor={colors.inputText}
                  multiline
                />
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.delete,
                    padding: 8,
                    borderRadius: 6,
                    alignItems: "center",
                  }}
                  onPress={() => eliminarNodo(index)}
                >
                  <Text style={{ color: "#fff" }}>Eliminar nodo</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={{
                backgroundColor: colors.button,
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
                marginBottom: 15,
              }}
              onPress={agregarNodo}
            >
              <Text style={{ color: colors.buttonText }}>➕ Agregar nodo</Text>
            </TouchableOpacity>

            {/* VISTA PREVIA COMENTADA PARA ELIMINAR */}
            {/*
            {nodos.length > 0 && (
              <View
                style={{
                  backgroundColor: colors.previewBg,
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 2,
                  borderColor: colors.previewBorder,
                  marginBottom: 15,
                }}
              >
                <Text
                  style={{
                    color: colors.previewBorder,
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: 10,
                  }}
                >
                  Vista previa del mapa mental
                </Text>
                <MapaMentalGrafico titulo={titulo} nodos={nodos} />
              </View>
            )}
            */}

            <TouchableOpacity
              style={{
                backgroundColor: colors.save,
                padding: 15,
                borderRadius: 10,
                alignItems: "center",
              }}
              onPress={guardarMapaMental}
              disabled={loading}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {loading ? "Guardando..." : "Guardar mapa mental"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 10, alignItems: "center" }}
              onPress={() => setMostrarFormulario(false)}
            >
              <Text style={{ color: colors.delete, fontWeight: "bold" }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={!!verMapaPreview} animationType="fade">
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: colors.fullscreenBg }}>
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 30,
                right: 20,
                backgroundColor: colors.closeBtn,
                padding: 10,
                borderRadius: 8,
                zIndex: 1000,
              }}
              onPress={() => setVerMapaPreview(null)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                ✖ Cerrar
              </Text>
            </TouchableOpacity>
            <MapaMentalZoom>
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  transform: [{ rotate: "90deg" }],
                }}
              >
                {verMapaPreview && (
                  <MapaMentalGrafico
                    titulo={verMapaPreview.titulo}
                    nodos={verMapaPreview.nodos}
                  />
                )}
              </View>
            </MapaMentalZoom>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </KeyboardAvoidingView>
  );
}
