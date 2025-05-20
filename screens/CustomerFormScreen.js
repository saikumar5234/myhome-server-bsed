import React, { useState, useContext, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, Modal, TouchableOpacity } from 'react-native';
import { CustomerContext } from './CustomerContext';
import { TextInput, Button, Switch, Text, Menu, Provider, Divider, Card } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import axios from './api';
import { format } from 'date-fns';

const CustomerFormScreen = ({ route }) => {
    const { roomNumber } = route.params;
    const { saveCustomer, getCustomer } = useContext(CustomerContext);

    const [allCustomers, setAllCustomers] = useState([]);
    const [name, setName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [rentAdvance, setRentAdvance] = useState('');
    const [firstRentAdvance, setFirstRentAdvance] = useState(null);
    const [rentMonth, setRentMonth] = useState('');
    const [rentPaid, setRentPaid] = useState('');
    const [maintenance, setMaintenance] = useState('');
    const [electricityBill, setElectricityBill] = useState('');
    const [parkingBill, setParkingBill] = useState('');
    const [date, setDate] = useState(format(new Date(), 'dd-MM-yyyy'));
    const [paymentStatus, setPaymentStatus] = useState(false);
    const [paymentMode, setPaymentMode] = useState('');
    const [chequeNumber, setChequeNumber] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [id, setId] = useState(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [fullImageUri, setFullImageUri] = useState('');

    useEffect(() => {
        fetchCustomerDetails();
    }, [roomNumber]);

    const fetchCustomerDetails = async () => {
        try {
            const response = await axios.get('/all');
            const roomCustomers = response.data.filter(customer => customer.roomNumber === roomNumber);
            setAllCustomers(roomCustomers.reverse());

            if (roomCustomers.length > 0) {
                const firstCustomer = roomCustomers[0];
                setFirstRentAdvance(firstCustomer.rentAdvance);

                if (!rentAdvance) {
                    setRentAdvance(firstCustomer.rentAdvance.toString());
                }
            }
        } catch (error) {
            console.error('Error fetching customer data:', error);
            alert('Failed to fetch customer details.');
        }
    };

    const handleSubmit = async () => {
        const customerData = {
            roomNumber,
            name,
            mobileNumber,
            rentAdvance: parseFloat(rentAdvance),
            rentMonth: parseFloat(rentMonth),
            rentPaid: parseFloat(rentPaid),
            maintenance: parseFloat(maintenance),
            electricityBill: parseFloat(electricityBill),
            parkingBill: parseFloat(parkingBill),
            paymentStatus: paymentStatus ? 'Paid' : 'Not Paid',
            paymentMode,
            chequeNumber: paymentMode === 'Cheque' ? chequeNumber : '',
            uploadedImage: uploadedImage || '',
            date,
        };

        try {
            if (editMode && id) {
                await axios.put(`/customer/${id}`, customerData);
                alert('Customer updated successfully!');
            } else {
                await axios.post('/customer', customerData);
                alert('Form submitted successfully!');
            }

            resetForm();
            fetchCustomerDetails();
        } catch (error) {
            console.error('Error saving customer:', error);
            alert('Failed to submit form.');
        }
    };

    const resetForm = () => {
        setName('');
        setMobileNumber('');
        setRentAdvance(firstRentAdvance || '');
        setRentMonth('');
        setRentPaid('');
        setMaintenance('');
        setElectricityBill('');
        setParkingBill('');
        setDate(format(new Date(), 'dd-MM-yyyy'));
        setPaymentStatus(false);
        setPaymentMode('');
        setChequeNumber('');
        setUploadedImage(null);
        setEditMode(false);
        setId(null);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            setUploadedImage(result.assets[0].uri);
        }
    };

    const isSubmitDisabled = !(
        name.trim() &&
        mobileNumber.trim() &&
        rentAdvance.trim() &&
        rentMonth.trim() &&
        rentPaid.trim() &&
        maintenance.trim() &&
        electricityBill.trim() &&
        parkingBill.trim() &&
        date.trim() &&
        paymentMode &&
        (paymentMode !== 'Cheque' || chequeNumber.trim())
    );

    const startEdit = (cust) => {
        setId(cust.id);
        setName(cust.name);
        setMobileNumber(cust.mobileNumber);
        setRentAdvance(cust.rentAdvance.toString());
        setRentMonth(cust.rentMonth.toString());
        setRentPaid(cust.rentPaid?.toString() || '');
        setMaintenance(cust.maintenance?.toString() || '');
        setElectricityBill(cust.electricityBill?.toString() || '');
        setParkingBill(cust.parkingBill?.toString() || '');
        setDate(cust.date);
        setPaymentStatus(cust.paymentStatus === 'Paid');
        setPaymentMode(cust.paymentMode);
        setChequeNumber(cust.chequeNumber || '');
        setUploadedImage(cust.uploadedImage || null);
        setEditMode(true);
    };

    const isRentAdvanceDisabled = allCustomers.length > 0;

    return (
        <Provider>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.heading}>Flat {roomNumber} - Customer Form</Text>

                <TextInput label="Customer Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
                <TextInput label="Mobile Number" value={mobileNumber} onChangeText={setMobileNumber} mode="outlined" keyboardType="phone-pad" style={styles.input} />
                <TextInput
                    label="Rent Advance"
                    value={rentAdvance}
                    onChangeText={setRentAdvance}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                    disabled={isRentAdvanceDisabled}
                />
                <TextInput label="Required Monthly Rent" value={rentMonth} onChangeText={setRentMonth} mode="outlined" keyboardType="numeric" style={styles.input} />
                <TextInput label="Rent Paid" value={rentPaid} onChangeText={setRentPaid} mode="outlined" keyboardType="numeric" style={styles.input} />
                <TextInput label="Maintenance" value={maintenance} onChangeText={setMaintenance} mode="outlined" keyboardType="numeric" style={styles.input} />
                <TextInput label="Electricity Bill" value={electricityBill} onChangeText={setElectricityBill} mode="outlined" keyboardType="numeric" style={styles.input} />
                <TextInput label="Parking Bill" value={parkingBill} onChangeText={setParkingBill} mode="outlined" keyboardType="numeric" style={styles.input} />
                <TextInput label="Date" value={date} onChangeText={setDate} mode="outlined" style={styles.input} />

                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <Button mode="outlined" onPress={() => setMenuVisible(true)} style={styles.input}>
                            {paymentMode ? paymentMode : 'Select Payment Mode'}
                        </Button>
                    }
                >
                    <Menu.Item onPress={() => { setPaymentMode('Cash'); setMenuVisible(false); }} title="Cash" />
                    <Divider />
                    <Menu.Item onPress={() => { setPaymentMode('Cheque'); setMenuVisible(false); }} title="Cheque" />
                    <Divider />
                    <Menu.Item onPress={() => { setPaymentMode('UPI'); setMenuVisible(false); }} title="UPI" />
                </Menu>

                {paymentMode === 'Cheque' && (
                    <>
                        <TextInput label="Cheque Number" value={chequeNumber} onChangeText={setChequeNumber} mode="outlined" keyboardType="numeric" style={styles.input} />
                        <Button mode="contained" onPress={pickImage} style={styles.uploadButton}>Upload Cheque Image</Button>
                    </>
                )}

                {paymentMode === 'UPI' && (
                    <Button mode="contained" onPress={pickImage} style={styles.uploadButton}>Upload UPI Screenshot</Button>
                )}

                {uploadedImage && (
                    <TouchableOpacity onPress={() => { setFullImageUri(uploadedImage); setModalVisible(true); }}>
                        <Image source={{ uri: uploadedImage }} style={styles.image} />
                    </TouchableOpacity>
                )}

                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Payment Status:</Text>
                    <Switch value={paymentStatus} onValueChange={() => setPaymentStatus(!paymentStatus)} />
                    <Text>{paymentStatus ? 'Paid' : 'Not Paid'}</Text>
                </View>

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    disabled={isSubmitDisabled}
                    style={styles.submitButton}
                >
                    {editMode ? 'Update' : 'Submit'}
                </Button>

                <Text style={styles.subHeading}>Submitted Details</Text>
                {allCustomers.map((cust, index) => (
                    <Card key={index} style={styles.card}>
                        <Card.Title title={`Entry ${allCustomers.length - index}`} />
                        <Card.Content>
                            <View style={styles.detailRow}><Text style={styles.label}>Customer Name</Text><Text style={styles.detail}>:     {cust.name}</Text></View>
                            <View style={styles.detailRow}><Text style={styles.label}>Mobile Number</Text><Text style={styles.detail}>:     {cust.mobileNumber}</Text></View>
                            <View style={styles.detailRow}><Text style={styles.label}>Rent Advance</Text><Text style={styles.detail}>:     {cust.rentAdvance}</Text></View>
                            <View style={styles.detailRow}><Text style={styles.label}>Required Monthly Rent</Text><Text style={styles.detail}>:     {cust.rentMonth}</Text></View>
                            <View style={styles.detailRow}><Text style={styles.label}>Rent Paid</Text><Text style={styles.detail}>:     {cust.rentPaid}</Text></View>
                            <View style={styles.detailRow}><Text style={styles.label}>Maintenance</Text><Text style={styles.detail}>:     {cust.maintenance}</Text></View>
                            <View style={styles.detailRow}><Text style={styles.label}>Parking Electric Bill</Text><Text style={styles.detail}>:     {cust.electricityBill}</Text></View>
                            <View style={styles.detailRow}><Text style={styles.label}>Parking Bill</Text><Text style={styles.detail}>:     {cust.parkingBill}</Text></View>
                            <View style={styles.detailRow}><Text style={styles.label}>Date</Text><Text style={styles.detail}>:     {cust.date}</Text></View>
                            <View style={styles.detailRow}><Text style={styles.label}>Payment Status</Text><Text style={styles.detail}>:     {cust.paymentStatus}</Text></View>
                            <View style={styles.detailRow}><Text style={styles.label}>Payment Mode</Text><Text style={styles.detail}>:     {cust.paymentMode}</Text></View>
                            {cust.paymentMode === 'Cheque' && (
                                <View style={styles.detailRow}><Text style={styles.label}>Cheque #</Text><Text style={styles.detail}>:     {cust.chequeNumber}</Text></View>
                            )}
                            {cust.uploadedImage && (
                                <TouchableOpacity onPress={() => { setFullImageUri(cust.uploadedImage); setModalVisible(true); }}>
                                    <Image source={{ uri: cust.uploadedImage }} style={styles.image} />
                                </TouchableOpacity>
                            )}
                            <Button mode="contained" onPress={() => startEdit(cust)} >
                                Edit
                            </Button>
                        </Card.Content>
                    </Card>
                ))}

                <Modal visible={modalVisible} transparent={true}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeText}>X</Text>
                        </TouchableOpacity>
                        <Image source={{ uri: fullImageUri }} style={styles.fullImage} />
                    </View>
                </Modal>
            </ScrollView>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#fff', padding: 20 },
    heading: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    subHeading: { fontSize: 20, fontWeight: 'bold', marginVertical: 15 },
    input: { marginVertical: 10 },
    uploadButton: { marginVertical: 10 },
    submitButton: { marginVertical: 10 },
    switchRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
    switchLabel: { fontSize: 16, marginRight: 10 },
    card: { marginVertical: 10, borderRadius: 10 },
    label: { fontSize: 16,  width: 200 },
    detail: { fontSize: 16,  flex: 1,  paddingLeft: 10,   textAlign: 'left', fontWeight: 'bold', },
    detailRow: { flexDirection: 'row', marginVertical: 4 },
    image: { width: '100%', height: 200, marginVertical: 10, resizeMode: 'cover', borderRadius: 8 },
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    fullImage: { width: '90%', height: '80%', resizeMode: 'contain' },
    modalClose: { position: 'absolute', top: 40, right: 20, zIndex: 2 },
    closeText: { fontSize: 24, color: '#fff' },
});

export default CustomerFormScreen;
