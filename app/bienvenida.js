import React, { useEffect, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const WelcomePopup = ({ nombre, onClose }) => {
  const [opacity] = useState(new Animated.Value(0));
  const [scale] = useState(new Animated.Value(0.7));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const cerrarAnimado = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.7,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[styles.popup, { opacity, transform: [{ scale }] }]}
      >
        <Text style={styles.titulo}>¡Bienvenido {nombre}! 👋</Text>
        <Text style={styles.subtitulo}>
          Estamos configurando tu experiencia personalizada.
        </Text>

        <TouchableOpacity style={styles.boton} onPress={cerrarAnimado}>
          <Text style={styles.textoBoton}>Continuar</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default WelcomePopup;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  popup: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#222",
  },
  subtitulo: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 25,
  },
  boton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    borderRadius: 12,
  },
  textoBoton: {
    textAlign: "center",
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
