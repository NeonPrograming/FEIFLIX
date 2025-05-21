import React from 'react';
import {  StyleSheet, Text, View } from "react-native";

const About: React.FC = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>About - FEI FLIX</Text>
      </View>
    );
  };

export default About;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
    },
});
