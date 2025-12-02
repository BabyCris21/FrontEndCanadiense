import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function EnfoqueSocioemocional() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Enfoque Socioemocional</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>😊 Registro emocional</Text>
        <Text style={styles.cardDesc}>Anota cómo te sientes cada día.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌬 Ejercicio de respiración 4-7-8</Text>
        <Text style={styles.cardDesc}>
          Ayuda a reducir ansiedad y mejorar concentración.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎯 Motivación y metas</Text>
        <Text style={styles.cardDesc}>
          Define metas realistas y recompensas cuando las cumplas.
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
