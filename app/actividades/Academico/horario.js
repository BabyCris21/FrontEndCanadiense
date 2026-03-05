import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Ionicons } from "@expo/vector-icons";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const dias = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const colores = {
  alta: "#FF6B6B",
  media: "#FFD93D",
  baja: "#4ECDC4",
};

export default function Horario() {
  const [horario, setHorario] = useState({});
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    guardar();
  }, [horario]);

  const cargar = async () => {
    const data = await AsyncStorage.getItem("horario");
    if (data) setHorario(JSON.parse(data));
  };

  const guardar = async () => {
    await AsyncStorage.setItem("horario", JSON.stringify(horario));
  };

  const agregarActividad = (dia) => {
    const nueva = {
      hora: "Seleccionar",
      actividad: "",
      prioridad: "media",
    };

    const nuevo = {
      ...horario,
      [dia]: [...(horario[dia] || []), nueva],
    };

    setHorario(nuevo);
  };

  const eliminarActividad = (dia, index) => {
    Alert.alert("Eliminar actividad", "¿Seguro que deseas eliminarla?", [
      { text: "Cancelar" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          const copia = { ...horario };
          copia[dia].splice(index, 1);
          setHorario(copia);
        },
      },
    ]);
  };

  const abrirPicker = (dia, index) => {
    setSelected({ dia, index });
    setPickerVisible(true);
  };

  const cambiarHora = (event, date) => {
    setPickerVisible(false);

    if (!date || !selected) return;

    const hora = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const copia = { ...horario };
    copia[selected.dia][selected.index].hora = hora;

    setHorario(copia);
  };

  const cambiarActividad = (dia, index, texto) => {
    const copia = { ...horario };
    copia[dia][index].actividad = texto;
    setHorario(copia);
  };

  const cambiarPrioridad = (dia, index, prioridad) => {
    const copia = { ...horario };
    copia[dia][index].prioridad = prioridad;
    setHorario(copia);
  };

  const exportarPDF = async () => {
    let html = `<h1 style="text-align:center;">Horario Académico</h1>`;

    dias.forEach((dia) => {
      html += `<h2>${dia}</h2>`;

      const acts = horario[dia] || [];

      acts.forEach((a) => {
        html += `
        <div style="
        background:#f1f5f9;
        padding:12px;
        border-left:6px solid ${colores[a.prioridad]};
        margin-bottom:10px;
        border-radius:10px;
        ">
        <strong>${a.hora}</strong><br/>
        ${a.actividad}
        </div>`;
      });
    });

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>📅 Mi Horario Inteligente</Text>

        {dias.map((dia) => (
          <View key={dia} style={styles.dayCard}>
            <Text style={styles.dayTitle}>{dia}</Text>

            {(horario[dia] || []).map((act, i) => (
              <View
                key={i}
                style={[
                  styles.activityCard,
                  { borderLeftColor: colores[act.prioridad] },
                ]}
              >
                {/* ELIMINAR */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => eliminarActividad(dia, i)}
                >
                  <Ionicons name="trash" size={18} color="#fff" />
                </TouchableOpacity>

                {/* HORA */}
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() => abrirPicker(dia, i)}
                >
                  <Ionicons name="time" size={18} color="#1E56A0" />
                  <Text style={styles.timeText}>{act.hora}</Text>
                </TouchableOpacity>

                {/* ACTIVIDAD */}
                <TextInput
                  placeholder="Actividad..."
                  value={act.actividad}
                  style={styles.input}
                  onChangeText={(t) => cambiarActividad(dia, i, t)}
                />

                {/* PRIORIDAD */}
                <View style={styles.priorityRow}>
                  {["baja", "media", "alta"].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityBtn,
                        {
                          backgroundColor:
                            act.prioridad === p ? colores[p] : "#e5e7eb",
                        },
                      ]}
                      onPress={() => cambiarPrioridad(dia, i, p)}
                    >
                      <Text style={styles.priorityText}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            {/* BOTON AGREGAR */}
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => agregarActividad(dia)}
            >
              <Ionicons name="add" size={22} color="#fff" />
              <Text style={styles.addText}>Agregar</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* EXPORTAR */}
        <TouchableOpacity style={styles.exportBtn} onPress={exportarPDF}>
          <Ionicons name="download" size={20} color="#fff" />
          <Text style={styles.exportText}>Exportar horario</Text>
        </TouchableOpacity>
      </ScrollView>

      {pickerVisible && (
        <DateTimePicker
          mode="time"
          display="spinner"
          value={new Date()}
          onChange={cambiarHora}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#1E56A0",
  },

  dayCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 20,
    padding: 15,
    elevation: 3,
  },

  dayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1E56A0",
  },

  activityCard: {
    backgroundColor: "#F8FAFF",
    borderLeftWidth: 6,
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },

  deleteBtn: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "#EF4444",
    padding: 5,
    borderRadius: 8,
    zIndex: 10,
  },

  timeBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  timeText: {
    marginLeft: 6,
    fontWeight: "bold",
    color: "#1E56A0",
  },

  input: {
    borderBottomWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 8,
  },

  priorityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  priorityBtn: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },

  priorityText: {
    fontWeight: "bold",
    fontSize: 12,
  },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6D5DF6",
    padding: 10,
    borderRadius: 30,
    alignSelf: "flex-start",
    marginTop: 5,
  },

  addText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "bold",
  },

  exportBtn: {
    flexDirection: "row",
    backgroundColor: "#1E56A0",
    padding: 15,
    margin: 20,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  exportText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
  },
});
