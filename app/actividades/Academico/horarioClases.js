import { useEffect, useState } from "react";
import {
  Modal,
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

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { Ionicons } from "@expo/vector-icons";

const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const horas = [
  "08:00",
  "08:45",
  "09:30",
  "10:15",
  "11:00",
  "RECREO_1",
  "11:30",
  "12:15",
  "13:00",
  "RECREO_2",
  "14:15",
  "15:00",
];

const cursos = [
  "Matemática",
  "Lenguaje",
  "Química",
  "Ed Física",
  "Historia",
  "Computación",
  "Arte",
  "Música",
  "Ed Cívica",
];

const coloresDia = {
  Lunes: "#9CC3E6",
  Martes: "#00E676",
  Miércoles: "#FFF176",
  Jueves: "#FFAB91",
  Viernes: "#CE93D8",
};

const prioridadColor = {
  alta: "#FF6B6B",
  media: "#FFD93D",
  baja: "#4ECDC4",
};

const esRecreo = (hora) => hora === "RECREO_1" || hora === "RECREO_2";

export default function HorarioClases() {
  const [horario, setHorario] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [celda, setCelda] = useState(null);

  const [curso, setCurso] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("media");

  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);

  useEffect(() => {
    cargar();
  }, []);
  useEffect(() => {
    guardar();
  }, [horario]);

  const cargar = async () => {
    const data = await AsyncStorage.getItem("horario_clases");
    if (data) setHorario(JSON.parse(data));
  };

  const guardar = async () => {
    await AsyncStorage.setItem("horario_clases", JSON.stringify(horario));
  };

  const calcularSemana = (fecha) => {
    const dia = fecha.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;

    const lunes = new Date(fecha);
    lunes.setDate(fecha.getDate() + diff);

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    setFechaInicio(lunes);
    setFechaFin(domingo);
  };

  const abrirCelda = (hora, dia) => {
    const existente = horario?.[hora]?.[dia];

    setCelda({ hora, dia });

    if (existente) {
      setCurso(existente.curso);
      setDescripcion(existente.descripcion);
      setPrioridad(existente.prioridad);
    } else {
      setCurso("");
      setDescripcion("");
      setPrioridad("media");
    }

    setModalVisible(true);
  };

  const guardarClase = () => {
    const copia = { ...horario };

    if (!copia[celda.hora]) copia[celda.hora] = {};

    copia[celda.hora][celda.dia] = {
      curso,
      descripcion,
      prioridad,
    };

    setHorario(copia);
    setModalVisible(false);
  };

  const limpiarHorario = async () => {
    setHorario({});
    await AsyncStorage.removeItem("horario_clases");
  };

  const sugerirEstudio = (hora, dia) => {
    const index = horas.indexOf(hora);
    if (index === 0) return null;

    const anterior = horas[index - 1];
    const claseAnterior = horario?.[anterior]?.[dia];

    return null;
  };

  const exportarPDF = async () => {
    const tituloSemana =
      fechaInicio && fechaFin
        ? `${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`
        : "";

    const html = `
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

<style>

body{
font-family: Arial, Helvetica, sans-serif;
padding:30px;
background:#f3f4f6;
}

.container{
background:white;
padding:25px;
border-radius:10px;
}

.title{
text-align:center;
font-size:26px;
font-weight:bold;
color:#1E56A0;
margin-bottom:4px;
}

.subtitle{
text-align:center;
font-size:13px;
color:#555;
margin-bottom:18px;
}

table{
width:100%;
border-collapse:collapse;
table-layout:fixed;
}

th{
border:2px solid #333;
padding:10px;
font-size:13px;
font-weight:bold;
text-align:center;
background:#E5E7EB;
}

td{
border:2px solid #333;
height:60px;
text-align:center;
vertical-align:middle;
font-size:12px;
padding:4px;
word-wrap:break-word;
}

.hora{
background:#E5E7EB;
font-weight:bold;
width:65px;
}

.recreo{
background:#E2E8F0;
font-weight:bold;
}

/* PRIORIDADES */

.prioridad-alta{
background:#FF6B6B;
}

.prioridad-media{
background:#FFD93D;
}

.prioridad-baja{
background:#4ECDC4;
}

.curso{
font-weight:bold;
font-size:12px;
}

.detalle{
font-size:11px;
color:#333;
}

</style>
</head>

<body>

<div class="container">

<div class="title">Horario de Clases</div>
<div class="subtitle">${tituloSemana}</div>

<table>

<tr>
<th class="hora">Hora</th>
<th>Lunes</th>
<th>Martes</th>
<th>Miércoles</th>
<th>Jueves</th>
<th>Viernes</th>
</tr>

${horas
  .map((hora) => {
    const recreo = esRecreo(hora);

    return `
<tr>

<td class="hora">
${recreo ? "Recreo" : hora}
</td>

${dias
  .map((dia) => {
    if (recreo) {
      return `<td class="recreo">Recreo</td>`;
    }

    const act = horario?.[hora]?.[dia];

    if (!act) {
      return `<td></td>`;
    }

    const detalle = act.descripcion?.trim() === "" ? "Clases" : act.descripcion;

    const prioridadClase = "prioridad-" + act.prioridad;

    return `
<td class="${prioridadClase}">
<div class="curso">${act.curso}</div>
<div class="detalle">${detalle}</div>
</td>
`;
  })
  .join("")}

</tr>
`;
  })
  .join("")}

</table>

</div>

</body>
</html>
`;

    const { uri } = await Print.printToFileAsync({
      html,
    });

    await Sharing.shareAsync(uri);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Horario de Clases</Text>
        <View style={styles.whiteCurve} />
      </View>

      <View style={styles.weekBox}>
        <Ionicons name="calendar" size={18} color="#1E56A0" />

        <Text style={styles.weekText}>
          {fechaInicio
            ? `${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`
            : "Seleccionar semana"}
        </Text>

        <TouchableOpacity onPress={() => setMostrarPicker(true)}>
          <Ionicons name="create" size={18} color="#1E56A0" />
        </TouchableOpacity>
      </View>

      {mostrarPicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setMostrarPicker(false);
            if (date) calcularSemana(date);
          }}
        />
      )}

      <ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            <View style={styles.headerRow}>
              <Text style={styles.headerHora}>Hora</Text>

              {dias.map((dia) => (
                <Text
                  key={dia}
                  style={[
                    styles.headerDia,
                    { backgroundColor: coloresDia[dia] },
                  ]}
                >
                  {dia}
                </Text>
              ))}
            </View>

            {horas.map((hora) => (
              <View key={hora} style={styles.row}>
                <Text style={styles.hora}>
                  {esRecreo(hora) ? "Recreo" : hora}
                </Text>

                {dias.map((dia) => {
                  if (esRecreo(hora)) {
                    return (
                      <View
                        key={dia}
                        style={[styles.cell, { backgroundColor: "#E2E8F0" }]}
                      >
                        <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                          Recreo
                        </Text>
                      </View>
                    );
                  }

                  const act = horario?.[hora]?.[dia];

                  return (
                    <TouchableOpacity
                      key={dia}
                      style={[
                        styles.cell,
                        {
                          backgroundColor: act
                            ? prioridadColor[act.prioridad]
                            : "#fff",
                        },
                      ]}
                      onPress={() => abrirCelda(hora, dia)}
                    >
                      {act ? (
                        <View style={{ alignItems: "center" }}>
                          <Text style={styles.textCell}>{act.curso}</Text>
                          <Text style={{ fontSize: 9 }}>{act.descripcion}</Text>
                        </View>
                      ) : (
                        <>
                          <Ionicons name="add" size={16} color="#94a3b8" />

                          {sugerirEstudio(hora, dia) && (
                            <Text style={{ fontSize: 8, color: "#64748b" }}>
                              {sugerirEstudio(hora, dia)}
                            </Text>
                          )}
                        </>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.exportBtn} onPress={exportarPDF}>
          <Ionicons name="download" size={20} color="white" />
          <Text style={styles.btnText}>Exportar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={limpiarHorario}>
          <Ionicons name="trash" size={20} color="white" />
          <Text style={styles.btnText}>Borrar</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {celda?.dia} {celda?.hora}
            </Text>

            <ScrollView style={{ maxHeight: 120 }}>
              {cursos.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.optBtn,
                    { backgroundColor: curso === c ? "#1E56A0" : "#e5e7eb" },
                  ]}
                  onPress={() => setCurso(c)}
                >
                  <Text style={{ color: curso === c ? "white" : "black" }}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              placeholder="Descripción..."
              value={descripcion}
              onChangeText={setDescripcion}
              style={styles.input}
            />

            <View style={styles.rowOpt}>
              {["baja", "media", "alta"].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.optBtn,
                    {
                      backgroundColor:
                        prioridad === p ? prioridadColor[p] : "#e5e7eb",
                    },
                  ]}
                  onPress={() => setPrioridad(p)}
                >
                  <Text>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={guardarClase}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFF" },

  topHeader: {
    backgroundColor: "#1E56A0",
    height: 110,
    paddingHorizontal: 20,
    paddingTop: 45,
  },

  headerTitle: { color: "white", fontSize: 20, fontWeight: "bold" },

  whiteCurve: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "white",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },

  weekBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#E1F0FF",
    borderRadius: 12,
  },

  weekText: { fontWeight: "bold", color: "#1E56A0" },

  table: {
    borderRadius: 15,
    overflow: "hidden",
    marginHorizontal: 15,
    backgroundColor: "#fff",
  },

  headerRow: { flexDirection: "row" },

  headerHora: {
    width: 70,
    padding: 8,
    backgroundColor: "#d1d5db",
    textAlign: "center",
    fontWeight: "bold",
  },

  headerDia: {
    width: 85,
    padding: 8,
    textAlign: "center",
    fontWeight: "bold",
  },

  row: { flexDirection: "row" },

  hora: {
    width: 70,
    height: 50,
    backgroundColor: "#f1f5f9",
    textAlign: "center",
    paddingTop: 15,
  },

  cell: {
    width: 85,
    height: 50,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  textCell: { fontSize: 10, fontWeight: "bold", textAlign: "center" },

  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    margin: 20,
    marginBottom: 80,
  },

  exportBtn: {
    flexDirection: "row",
    backgroundColor: "#1E56A0",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },

  deleteBtn: {
    flexDirection: "row",
    backgroundColor: "#EF4444",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },

  btnText: { color: "white", fontWeight: "bold" },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    width: 280,
  },

  modalTitle: { fontWeight: "bold", marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
  },

  rowOpt: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  optBtn: {
    padding: 10,
    borderRadius: 20,
    marginBottom: 5,
  },

  saveBtn: {
    backgroundColor: "#1E56A0",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  saveText: { color: "white", fontWeight: "bold" },
});
