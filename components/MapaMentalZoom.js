import { useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { PinchGestureHandler, State } from "react-native-gesture-handler";

export default function MapaMentalZoom({ children }) {
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);

  const onPinch = Animated.event([{ nativeEvent: { scale } }], {
    useNativeDriver: true,
  });

  const onStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      lastScale.current *= event.nativeEvent.scale;
      scale.setValue(lastScale.current);
    }
  };

  return (
    <PinchGestureHandler
      onGestureEvent={onPinch}
      onHandlerStateChange={onStateChange}
    >
      <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </PinchGestureHandler>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});
