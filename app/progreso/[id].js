import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { AnimatedCircularProgress } from "react-native-circular-progress";
import API from "../services/api";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const COLORS = {
  primaryBlue: "#1E56A0",
  textDark: "#2D4B7A",
  textGray: "#718096",
  bgGray: "#F8FAFF",
};

export default function ReporteAlumno() {
  const { id, nombre, apellido, grado, dni, correo } = useLocalSearchParams();
  const router = useRouter();

  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarActividades = async () => {
    try {
      const res = await API.get(`/actividades/usuario/${id}`);
      setActividades(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarActividades();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
      </View>
    );
  }

  const flashcards = actividades.filter((a) => a.tipo === "flashcard");
  const mapas = actividades.filter((a) => a.tipo === "mapa-mental");

  const flashGoal = 4;
  const mapaGoal = 2;

  const flashProgress = Math.min(flashcards.length / flashGoal, 1);
  const mapaProgress = Math.min(mapas.length / mapaGoal, 1);
  const generalProgress = (flashProgress + mapaProgress) / 2;

  const porcentajeGeneral = Math.round(generalProgress * 100);

  const getEmoji = (value) => {
    if (value < 0.4) return "😢";
    if (value < 0.8) return "🙂";
    return "😃";
  };

  const obtenerSugerencia = (porcentaje) => {
    if (porcentaje >= 90)
      return "Excelente desempeño. El estudiante demuestra dominio del contenido.";

    if (porcentaje >= 70)
      return "Buen progreso. Continúe practicando para consolidar el aprendizaje.";

    if (porcentaje >= 40)
      return "Progreso moderado. Se recomienda reforzar las actividades.";

    return "Progreso bajo. Se recomienda aumentar la constancia en las actividades.";
  };

  const generarPDF = async () => {
    const fecha = new Date();

    const html = `
<html>
<head>

<style>

body{
font-family: Arial;
background:#F2F6FF;
padding:40px;
color:#2D4B7A;
}

.header{
font-size:30px;
font-weight:bold;
color:#1E56A0;
margin-bottom:25px;
border-bottom:3px solid #1E56A0;
padding-bottom:10px;
}

/* TARJETA PRINCIPAL */

.card{
background:white;
border-radius:15px;
padding:25px;
margin-bottom:25px;
box-shadow:0 4px 12px rgba(0,0,0,0.08);
}

/* DATOS DEL ALUMNO */

.info-row{
display:flex;
margin-bottom:10px;
font-size:15px;
}

.info-label{
width:180px;
font-weight:bold;
color:#1E56A0;
}

.info-value{
flex:1;
color:#333;
}

/* ESTADISTICAS */

.stats{
display:flex;
justify-content:space-between;
margin:30px 0;
}

.stat{
background:white;
padding:20px;
border-radius:12px;
width:30%;
text-align:center;
font-weight:bold;
box-shadow:0 4px 10px rgba(0,0,0,0.08);
font-size:20px;
color:#1E56A0;
}

.stat span{
display:block;
font-size:14px;
color:#555;
margin-top:5px;
}

/* SECCIONES */

.section{
font-size:20px;
font-weight:bold;
margin-top:30px;
margin-bottom:15px;
color:#1E56A0;
border-left:5px solid #1E56A0;
padding-left:10px;
}

/* ACTIVIDADES */

.activity{
background:white;
padding:15px;
border-radius:10px;
margin-bottom:10px;
box-shadow:0 2px 6px rgba(0,0,0,0.08);
}

.activity-title{
font-weight:bold;
font-size:15px;
}

.activity-date{
font-size:12px;
color:#666;
margin-top:3px;
}

/* BARRAS DE PROGRESO */

.progress-card{
background:white;
padding:18px;
border-radius:12px;
margin-bottom:15px;
box-shadow:0 2px 6px rgba(0,0,0,0.08);
}

.bar{
width:100%;
height:16px;
background:#E5E7EB;
border-radius:10px;
margin-top:8px;
overflow:hidden;
}

.fill{
height:100%;
background:#1E56A0;
border-radius:10px;
}

/* TEXTO FINAL */

.center{
text-align:center;
margin-top:25px;
}

.percent{
font-size:20px;
font-weight:bold;
color:#1E56A0;
}

</style>

</head>

<body>

<div class="header">
Reporte del Alumno
</div>

<div class="card">

<div class="info-row">
<div class="info-label">Nombre:</div>
<div class="info-value">${nombre}</div>
</div>

<div class="info-row">
<div class="info-label">Apellidos:</div>
<div class="info-value">${apellido}</div>
</div>

<div class="info-row">
<div class="info-label">Correo:</div>
<div class="info-value">${correo}</div>
</div>

<div class="info-row">
<div class="info-label">Grado:</div>
<div class="info-value">${grado}</div>
</div>

<div class="info-row">
<div class="info-label">DNI:</div>
<div class="info-value">${dni}</div>
</div>

<div class="info-row">
<div class="info-label">Fecha de reporte:</div>
<div class="info-value">${fecha.toLocaleDateString()}</div>
</div>

</div>

<div class="stats">

<div class="stat">
${flashcards.length}
<span>Flashcards</span>
</div>

<div class="stat">
${mapas.length}
<span>Mapas</span>
</div>

<div class="stat">
${actividades.length}
<span>Total</span>
</div>

</div>

<div class="section">Flashcards</div>

${flashcards
  .map(
    (a) => `
<div class="activity">
<div class="activity-title">${a.titulo}</div>
<div class="activity-date">${new Date(a.createdAt).toLocaleDateString()}</div>
</div>
`,
  )
  .join("")}

<div class="section">Mapas Mentales</div>

${mapas
  .map(
    (a) => `
<div class="activity">
<div class="activity-title">${a.titulo}</div>
<div class="activity-date">${new Date(a.createdAt).toLocaleDateString()}</div>
</div>
`,
  )
  .join("")}

<div class="section">Progreso</div>

<div class="progress-card">
Flashcards (${Math.round(flashProgress * 100)}%)
<div class="bar">
<div class="fill" style="width:${Math.round(flashProgress * 100)}%"></div>
</div>
</div>

<div class="progress-card">
Mapas Mentales (${Math.round(mapaProgress * 100)}%)
<div class="bar">
<div class="fill" style="width:${Math.round(mapaProgress * 100)}%"></div>
</div>
</div>

<div class="progress-card">
Progreso General (${porcentajeGeneral}%)
<div class="bar">
<div class="fill" style="width:${porcentajeGeneral}%"></div>
</div>
</div>

<div class="center">

<div class="percent">
Avance total: ${porcentajeGeneral}% ${getEmoji(generalProgress)}
</div>

<p>
${obtenerSugerencia(porcentajeGeneral)}
</p>

</div>

</body>
</html>
`;

    const { uri } = await Print.printToFileAsync({ html });

    await Sharing.shareAsync(uri);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.title}>Reporte del Alumno</Text>
        </View>

        {/* DATOS DEL ESTUDIANTE */}

        <View style={styles.studentCard}>
          <Text style={styles.studentName}>
            {nombre} {apellido}
          </Text>
          <Text style={styles.studentInfo}>DNI: {dni}</Text>
          <Text style={styles.studentInfo}>Grado: {grado}</Text>
          <Text style={styles.studentInfo}>{correo}</Text>
        </View>

        {/* RESUMEN */}

        <View style={styles.statsContainer}>
          <Stat
            icon="cards-outline"
            value={flashcards.length}
            label="Flashcards"
          />

          <Stat icon="graph-outline" value={mapas.length} label="Mapas" />

          <Stat
            icon="analytics-outline"
            value={actividades.length}
            label="Total"
          />
        </View>

        {/* FLASHCARDS */}

        {flashcards.length > 0 && (
          <>
            <Text style={styles.section}>Flashcards</Text>

            {flashcards.map((item) => (
              <ItemCard
                key={item._id}
                icon="cards-outline"
                title={item.titulo}
                date={item.createdAt}
                onPress={() => router.push(`/progreso/actividad/${item._id}`)}
              />
            ))}
          </>
        )}

        {/* MAPAS */}

        {mapas.length > 0 && (
          <>
            <Text style={styles.section}>Mapas Mentales</Text>

            {mapas.map((item) => (
              <ItemCard
                key={item._id}
                icon="graph-outline"
                title={item.titulo}
                date={item.createdAt}
                onPress={() => router.push(`/progreso/actividad/${item._id}`)}
              />
            ))}
          </>
        )}

        {/* PROGRESO */}

        <Text style={styles.section}>Progreso del estudiante</Text>

        <View style={styles.progressRow}>
          <Circle value={flashProgress} label="Flashcards" />

          <Circle value={mapaProgress} label="Mapas" />

          <Circle value={generalProgress} label="General" />
        </View>

        <Text style={styles.progressText}>
          Avance total: {porcentajeGeneral}% {getEmoji(generalProgress)}
        </Text>

        <Text style={styles.sugerencia}>
          {obtenerSugerencia(porcentajeGeneral)}
        </Text>

        {/* BOTON PDF */}

        <TouchableOpacity style={styles.reportBtn} onPress={generarPDF}>
          <Text style={styles.reportText}>Generar reporte</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const Stat = ({ icon, value, label }) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={28} color="#1E56A0" />

    <Text style={styles.statNumber}>{value}</Text>

    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ItemCard = ({ icon, title, date, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={22} color="#1E56A0" />

    <View style={{ marginLeft: 10 }}>
      <Text style={styles.cardTitle}>{title}</Text>

      <Text style={styles.cardDate}>{new Date(date).toLocaleDateString()}</Text>
    </View>
  </TouchableOpacity>
);

const Circle = ({ value, label }) => {
  const percent = Math.round(value * 100);

  return (
    <View style={styles.circleContainer}>
      <AnimatedCircularProgress
        size={95}
        width={10}
        fill={percent}
        tintColor="#1E56A0"
        backgroundColor="#E5E7EB"
      >
        {() => <Text style={styles.percent}>{percent}%</Text>}
      </AnimatedCircularProgress>

      <Text style={styles.circleLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },

  container: {
    flex: 1,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    backgroundColor: "#1E56A0",
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },

  studentCard: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
  },

  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D4B7A",
  },

  studentInfo: {
    color: "#718096",
    marginTop: 4,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: -10,
  },

  statCard: {
    backgroundColor: "white",
    width: 110,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    elevation: 3,
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },

  statLabel: {
    fontSize: 12,
    color: "#718096",
  },

  section: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 25,
    marginLeft: 20,
    color: "#2D4B7A",
  },

  card: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  cardTitle: {
    fontWeight: "bold",
    color: "#2D4B7A",
  },

  cardDate: {
    fontSize: 12,
    color: "#718096",
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
  },

  circleContainer: {
    alignItems: "center",
  },

  percent: {
    fontSize: 16,
    fontWeight: "bold",
  },

  circleLabel: {
    marginTop: 6,
  },

  progressText: {
    textAlign: "center",
    marginTop: 20,
    fontWeight: "bold",
    fontSize: 15,
  },

  sugerencia: {
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 30,
    color: "#555",
  },

  reportBtn: {
    backgroundColor: "#1E56A0",
    margin: 25,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },

  reportText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
