import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Text, TextInput, Button, Dialog, Portal, Paragraph, Card } from 'react-native-paper';
import axios from './api'; // Ensure this points to your configured Axios instance

const DeleteFlatScreen = () => {
  const [roomToDelete, setRoomToDelete] = useState('');
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [deleteRoomNumber, setDeleteRoomNumber] = useState('');
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!roomToDelete) {
      alert('Please enter a room number.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('/all');
      const customerData = response.data;
      
      // Use the updated filter logic to match the room number properly
      const roomCustomers = customerData.filter(customer => customer.roomNumber.toString() === roomToDelete.toString());

      if (roomCustomers.length > 0) {
        setRoomDetails(roomCustomers);
      } else {
        alert('Room not found!');
        setRoomDetails(null);
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
      alert('Failed to fetch room details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePress = (roomNumber) => {
    setDeleteRoomNumber(roomNumber);
    setIsDialogVisible(true);
  };

  const handleDelete = async () => {
    // Add logic to delete the room from the backend here
    try {
      await axios.delete(`/rooms/${deleteRoomNumber}`); // Assuming your API endpoint for deleting is like this
      alert(`Room ${deleteRoomNumber} deleted successfully!`);

      // Close the dialog after deletion
      setIsDialogVisible(false);
      setDeleteRoomNumber('');
      setRoomDetails(null);
      setRoomToDelete('');
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete the room.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Delete Flat</Text>

      <TextInput
        label="Enter Flat Number"
        value={roomToDelete}
        onChangeText={setRoomToDelete}
        style={styles.input}
        keyboardType="numeric"
        placeholder="E.g., 101"
        mode="outlined"
      />

      <Button
        mode="contained"
        onPress={handleSearch}
        style={styles.searchButton}
        loading={loading}
      >
        Search
      </Button>

      {roomDetails && roomDetails.length > 0 && (
        <>
          <Text style={styles.subHeading}>Room Details</Text>
          {roomDetails.map((cust, index) => (
            <Card key={index} style={styles.card}>
              <Card.Title title={`Entry ${roomDetails.length - index}`} />
              <Card.Content>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Name:</Text>
                  <Text style={styles.detail}>{cust.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Mobile:</Text>
                  <Text style={styles.detail}>{cust.mobileNumber}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Advance:</Text>
                  <Text style={styles.detail}>{cust.rentAdvance}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Rent:</Text>
                  <Text style={styles.detail}>{cust.rentMonth}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Date:</Text>
                  <Text style={styles.detail}>{cust.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Status:</Text>
                  <Text style={styles.detail}>{cust.paymentStatus}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Mode:</Text>
                  <Text style={styles.detail}>{cust.paymentMode}</Text>
                </View>
                {cust.paymentMode === 'Cheque' && (
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Cheque #:</Text>
                    <Text style={styles.detail}>{cust.chequeNumber}</Text>
                  </View>
                )}
                {cust.uploadedImage && (
                  <Image source={{ uri: cust.uploadedImage }} style={styles.image} />
                )}
              </Card.Content>
            </Card>
          ))}

          <Button
            mode="contained"
            onPress={() => handleDeletePress(roomToDelete)}
            style={styles.deleteButton}
            buttonColor="red"
          >
            Delete Flat
          </Button>
        </>
      )}

      {/* Dialog for Confirmation */}
      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
          <Dialog.Title><Text>Confirm Deletion</Text></Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete room {deleteRoomNumber}?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDelete}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  subHeading: { fontSize: 20, fontWeight: 'bold', marginVertical: 15 },
  input: { marginBottom: 20, backgroundColor: 'white', height: 45, fontSize: 16 },
  searchButton: { marginBottom: 20 },
  deleteButton: { marginTop: 20 },
  card: { marginVertical: 10, borderRadius: 10 },
  label: { fontSize: 16, fontWeight: 'bold', width: 120 },
  detail: { fontSize: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  image: { width: '100%', height: 200, marginTop: 10, borderRadius: 10 },
});

export default DeleteFlatScreen;
