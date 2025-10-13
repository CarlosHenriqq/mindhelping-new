import React from "react";
import { StyleSheet, View } from "react-native";

const ProgressBar = ({ progress, total }) => {
  const percentage = total > 0 ? (progress / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.filler, { width: `${percentage}%` }]} />
    </View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
  container: {
    width: 150,
    height: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
    
  },
  filler: {
    height: "100%",
    backgroundColor: "#2980B9",
    borderRadius: 10,
  },
});
