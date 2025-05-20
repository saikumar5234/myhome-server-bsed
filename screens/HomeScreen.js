import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { Button } from 'react-native-paper';



const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Image source={require('../assets/home.png')} style={styles.logo} />
        <Text style={styles.heading}>My Home</Text>
      </View>

      {/* Navigation Buttons */}
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Rooms')}
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonText}
      >
        Cash Inflow
      </Button>

      <Button
        mode="outlined"
        onPress={() => navigation.navigate('CashOutflow')}
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonText}
      >
        Cash Outflow
      </Button>

      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Report')}
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonText}
      >
        Reports
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('DeleteFlatScreen')}
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonText}
      >
        Delete Flat
      </Button>

    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 10,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 1,
  },
  button: {
    width: width * 0.8,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 2,
    overflow: 'hidden',
  },
  buttonContent: {
    backgroundColor: '#fff',
    paddingVertical: 12,          // Reduced from 20 to prevent cutting
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 60,                // Ensure enough space for font
  },
  buttonText: {
    fontSize: 19,
    // fontWeight: 'bold',
    textAlign: 'center',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
});
