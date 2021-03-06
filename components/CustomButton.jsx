import React from 'react';
import {
  StyleSheet, TouchableOpacity, Text,
} from 'react-native';

const styles = StyleSheet.create({
  button: {
    // shadow but only for ios
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.26,
    // shadow on android
    elevation: 8,
    borderRadius: 10,
    marginVertical: 8,
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
  },
});

const CustomButton = (props) => (
  // using spread operators below lets you add other styles from outside this component
  <TouchableOpacity
    style={{ ...styles.button, ...props.style }}
    onPress={props.onPress}
  >
    <Text style={styles.text}>{props.title}</Text>
  </TouchableOpacity>
);

export default CustomButton;
