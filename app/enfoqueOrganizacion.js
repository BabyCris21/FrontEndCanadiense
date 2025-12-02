import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function EnfoqueAcademico() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Enfoque Académico</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📘 Organizar horarios de estudio</Text>
        <Text style={styles.cardDesc}>
          Crea un horario semanal para distribuir tus tiempos de estudio.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⏱ Técnica Pomodoro</Text>
        <Text style={styles.cardDesc}>
          25 minutos de estudio, 5 minutos de descanso. Repite 4 veces.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📝 Resúmenes y mapas mentales</Text>
        <Text style={styles.cardDesc}>
          Resume los temas y crea mapas mentales para memorizar mejor.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f7f7f7" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#6A5AE0",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardDesc: { fontSize: 14, marginTop: 6 },
});
