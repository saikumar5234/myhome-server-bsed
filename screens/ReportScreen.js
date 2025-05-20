import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Title, Text, Button, DataTable, Divider, Menu, Divider as PaperDivider } from 'react-native-paper';
import axios from './api';
import { printAsync } from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formatDate = (dateStr) => {
  const [yyyy, mm, dd] = dateStr.split('-');
  return `${dd}-${mm}-${yyyy}`;
};

const ReportScreen = () => {
  const [inflows, setInflows] = useState([]);
  const [outflows, setOutflows] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalOutcome, setTotalOutcome] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  const getMonthDateRange = (month) => {
    const year = new Date().getFullYear();
    const startDate = new Date(year, month, 2);
    const endDate = new Date(year, month + 1, 1);
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const fetchData = async () => {
    if (selectedMonth === '') {
      Alert.alert('Error', 'Please select a month.');
      return;
    }

    const { startDate, endDate } = getMonthDateRange(selectedMonth);

    try {
      const inflowResponse = await axios.get('/customers/inflows', {
        params: { startDate, endDate },
      });
      const outflowResponse = await axios.get('/outflows', {
        params: { startDate, endDate },
      });

      // Calculate totalRent = rentMonth + parkingBill + electricityBill + maintenance
      const inflowData = inflowResponse.data.map(entry => ({
        ...entry,
        totalRent: entry.rentMonth + entry.parkingBill + entry.electricityBill + entry.maintenance,
        totalPaid: entry.rentPaid + entry.parkingBill + entry.electricityBill + entry.maintenance,
      }));


      const totalIncomeValue = inflowData.reduce((sum, entry) => sum + entry.totalPaid, 0);
      const totalOutcomeValue = outflowResponse.data.reduce((sum, entry) => sum + entry.amount, 0);

      setInflows(inflowData);
      setOutflows(outflowResponse.data);
      setTotalIncome(totalIncomeValue);
      setTotalOutcome(totalOutcomeValue);
      setRemainingBalance(totalIncomeValue - totalOutcomeValue);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch report data.');
    }
  };

  const generateHTML = () => {
    const inflowRows = inflows.map(i =>
      `<tr>
    <td>${i.roomNumber}</td>
    <td>${i.name}</td>
    <td>${formatDate(i.date)}</td>
    <td>₹${i.totalRent}</td>
    <td>₹${i.totalPaid}</td>
    <td>₹${i.totalRent - i.totalPaid}</td>
  </tr>`
    ).join('');


    const outflowRows = outflows.map(o =>
      `<tr><td>${o.name}</td><td>${o.purpose}</td><td>${formatDate(o.date)}</td><td>₹${o.amount}</td></tr>`
    ).join('');

    const selectedMonthName = selectedMonth !== '' ? monthNames[selectedMonth] : 'N/A';
    const { startDate, endDate } = getMonthDateRange(selectedMonth);

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1, h2, h3 { text-align: center; }
            .branding { background-color: #4B0082; color: white; padding: 10px 0; text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            p { font-size: 16px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="branding">SAINI TRADERS</div>
          <h1>Financial Report</h1>
          <h2>Month: ${selectedMonthName}</h2>
          <p><strong>Date Range:</strong> ${formatDate(startDate)} to ${formatDate(endDate)}</p>

          <h2>Cash Inflow</h2>
          <table>
            <tr>
              <th>Flat No</th><th>Person</th><th>Date</th>
              <th>Total Rent</th><th>Rent Paid</th><th>Remaining</th>
            </tr>
            ${inflowRows}
          </table>
          <p>Total Income: ₹${totalIncome}</p>

          <h2>Cash Outflow</h2>
          <table>
            <tr><th>Person</th><th>Purpose</th><th>Date</th><th>Amount</th></tr>
            ${outflowRows}
          </table>
          <p>Total Outcome: ₹${totalOutcome}</p>

          <h3>Remaining Balance: ₹${remainingBalance}</h3>
        </body>
      </html>
    `;
  };

  const handleExport = async () => {
    try {
      const htmlContent = generateHTML();
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('PDF export error:', error);
      Alert.alert('Error', 'Failed to generate or share PDF');
    }
  };

  const handlePrint = async () => {
    try {
      const html = generateHTML();
      await printAsync({ html });
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Error', 'Failed to print');
    }
  };

  const handleClearReports = async () => {
    Alert.alert(
      'Confirm',
      'Are you sure you want to delete all reports?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete('/customers/clear-reports');
              setInflows([]);
              setOutflows([]);
              setTotalIncome(0);
              setTotalOutcome(0);
              setRemainingBalance(0);
              Alert.alert('Success', 'All reports cleared successfully.');
            } catch (error) {
              console.error('Clear reports error:', error);
              Alert.alert('Error', 'Failed to clear reports.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Financial Report</Title>

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setMenuVisible(true)}
            style={styles.selectMonthButton}
            labelStyle={{ color: '#6200ee' }}
          >
            {selectedMonth === '' ? 'Select Month' : monthNames[selectedMonth]}
          </Button>
        }
      >
        {monthNames.map((month, index) => (
          <Menu.Item
            key={index}
            title={month}
            onPress={() => {
              setSelectedMonth(index);
              setMenuVisible(false);
            }}
          />
        ))}
      </Menu>

      <Button mode="contained" onPress={fetchData} style={styles.button}>
        Fetch Report
      </Button>

      <Text style={styles.sectionTitle}>Cash Inflow</Text>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Flat No</DataTable.Title>
          <DataTable.Title>Person</DataTable.Title>
          <DataTable.Title>Date</DataTable.Title>
          <DataTable.Title numeric>Total Rent</DataTable.Title>
          <DataTable.Title numeric>Rent Paid</DataTable.Title>
          <DataTable.Title numeric>Remaining</DataTable.Title>
        </DataTable.Header>
        {inflows.map((item, index) => (
          <DataTable.Row key={index}>
            <DataTable.Cell>{item.roomNumber}</DataTable.Cell>
            <DataTable.Cell>{item.name}</DataTable.Cell>
            <DataTable.Cell>{formatDate(item.date)}</DataTable.Cell>
            <DataTable.Cell numeric>₹{item.totalRent}</DataTable.Cell>
            <DataTable.Cell numeric>₹{item.totalPaid}</DataTable.Cell>
            <DataTable.Cell numeric>₹{item.totalRent - item.totalPaid}</DataTable.Cell>

          </DataTable.Row>
        ))}
      </DataTable>
      <Text style={styles.total}>Total Income: ₹{totalIncome}</Text>

      <PaperDivider style={{ marginVertical: 10 }} />

      <Text style={styles.sectionTitle}>Cash Outflow</Text>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Person</DataTable.Title>
          <DataTable.Title>Purpose</DataTable.Title>
          <DataTable.Title>Date</DataTable.Title>
          <DataTable.Title numeric>Amount</DataTable.Title>
        </DataTable.Header>
        {outflows.map((item, index) => (
          <DataTable.Row key={index}>
            <DataTable.Cell>{item.name}</DataTable.Cell>
            <DataTable.Cell>{item.purpose}</DataTable.Cell>
            <DataTable.Cell>{formatDate(item.date)}</DataTable.Cell>
            <DataTable.Cell numeric>₹{item.amount}</DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
      <Text style={styles.total}>Total Outcome: ₹{totalOutcome}</Text>

      <PaperDivider style={{ marginVertical: 10 }} />

      <Text style={[styles.balance, { textAlign: 'center' }]}>Remaining Balance: ₹{remainingBalance}</Text>

      <Button mode="contained" onPress={handleExport} style={styles.button}>
        Export as PDF
      </Button>

      <Button mode="outlined" onPress={handlePrint} style={styles.button}>
        Print Report
      </Button>

      <Button
        mode="contained"
        onPress={handleClearReports}
        disabled={inflows.length === 0 && outflows.length === 0}
        style={[
          styles.button,
          { backgroundColor: inflows.length === 0 && outflows.length === 0 ? '#d3d3d3' : 'red' },
        ]}
      >
        Clear Reports
      </Button>
    </ScrollView>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  button: {
    marginVertical: 10,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  balance: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  selectMonthButton: {
    marginVertical: 10,
    alignSelf: 'center',
  },
});
