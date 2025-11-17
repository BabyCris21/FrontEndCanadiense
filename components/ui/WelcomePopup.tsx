import { useEffect, useRef } from "react";
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface Props {
  visible: boolean;
  nombre: string;
  onClose: () => void;
}

export default function WelcomePopup({ visible, nombre, onClose }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.popup,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Text style={styles.title}>¡Bienvenido, {nombre}! 👋</Text>

          <Text style={styles.subtitle}>
            Estamos felices de tenerte aquí.
          </Text>

          <Text style={styles.description}>
            Esta aplicación te ayudará a mejorar tus hábitos de estudio,
            organizar tus tareas y seguir un ritmo adecuado para aprender mejor.
          </Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Comenzar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center"
  },
  popup: {
    width: "85%",
    backgroundColor: "#ffffff",
    padding: 25,
    borderRadius: 18,
    elevation: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#4a2cff"
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    color: "#555",
    marginBottom: 25
  },
  button: {
    backgroundColor: "#4a2cff",
    paddingVertical: 12,
    borderRadius: 10
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center"
  }
});
