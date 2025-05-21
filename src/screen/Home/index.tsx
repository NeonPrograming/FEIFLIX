import React from 'react';
import {  StyleSheet, Text, View } from "react-native";

const Home: React.FC = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Home - FEI FLIX</Text>
      </View>
    );
  };

export default Home;

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
