import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Card, Text, Provider, Dialog, Portal } from 'react-native-paper';
import axios from 'axios';

const getTodayDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
};

const CashOutflowForm = () => {
  const [expenses, setExpenses] = useState([
    { id: Date.now(), person: '', purpose: '', date: getTodayDate(), amount: '' },
  ]);
  const [submittedExpenses, setSubmittedExpenses] = useState([]);
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  useEffect(() => {
    fetchSubmittedExpenses();
  }, []);

  const fetchSubmittedExpenses = async () => {
    try {
      const response = await axios.get('https://spring-dep-doc-1.onrender.com/customers/customers/outflows');
      const backendData = response.data.map((item) => ({
        id: item.id,
        person: item.name,
        purpose: item.purpose,
        date: item.date,  // Assuming backend is sending date in dd-mm-yyyy format
        amount: item.amount,
      }));
      setSubmittedExpenses(backendData);
    } catch (error) {
      console.error('Error fetching submitted expenses from server:', error);
      Alert.alert('Error', 'Failed to fetch data from server.');
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index][field] = value;
    setExpenses(updatedExpenses);
  };

  const isSubmitDisabled = expenses.length === 0 || expenses.every((item) => item.amount.trim() === '');

  const handleSubmit = async () => {
    try {
      await Promise.all(
        expenses.map((expense) =>
          axios.post('https://spring-dep-doc-1.onrender.com/customers/outflow', {
            id: expense.id,
            name: expense.person,
            purpose: expense.purpose,
            date: expense.date,
            amount: parseFloat(expense.amount),
          })
        )
      );

      await fetchSubmittedExpenses();
      setExpenses([{ id: Date.now(), person: '', purpose: '', date: getTodayDate(), amount: '' }]);
      Alert.alert('Success', 'Expenses submitted successfully!');
    } catch (error) {
      console.error('Error submitting expenses:', error);
      Alert.alert('Error', 'Failed to submit expenses.');
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      Alert.alert('Error', 'Invalid ID for deletion.');
      return;
    }
    try {
      await axios.delete(`https://spring-dep-doc-1.onrender.com/customers/outflow/${id}`);
      const updatedExpenses = submittedExpenses.filter(exp => exp.id !== id);
      setSubmittedExpenses(updatedExpenses);
      Alert.alert('Success', 'Expense deleted successfully!');
    } catch (error) {
      console.error('Error deleting expense:', error);
      Alert.alert('Error', 'Failed to delete expense.');
    }
  };

  const showDeleteDialog = (id) => {
    setExpenseToDelete(id);
    setVisibleDialog(true);
  };

  const hideDeleteDialog = () => {
    setVisibleDialog(false);
    setExpenseToDelete(null);
  };

  const isAmountDisabled = !expenses[0].person.trim() || !expenses[0].purpose.trim();

  return (
    <Provider>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Cash Outflow Entry</Text>

        {expenses.map((expense, index) => (
          <View key={expense.id} style={styles.formCard}>
            <TextInput
              label="Person"
              value={expense.person}
              onChangeText={(text) => handleInputChange(index, 'person', text)}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Purpose"
              value={expense.purpose}
              onChangeText={(text) => handleInputChange(index, 'purpose', text)}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Date (dd-mm-yyyy)"
              value={expense.date}
              onChangeText={(text) => handleInputChange(index, 'date', text)}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Amount"
              value={expense.amount}
              onChangeText={(text) => handleInputChange(index, 'amount', text)}
              keyboardType="numeric"
              mode="outlined"
              disabled={isAmountDisabled}
              style={styles.input}
            />
          </View>
        ))}

        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          style={styles.submitButton}
        >
          Submit Expenses
        </Button>

        <Text style={styles.heading}>Submitted Expenses</Text>

        {submittedExpenses.map((item, index) => (
          <Card key={item.id} style={styles.card}>
            <Card.Title title={`Expense #${index + 1}`} />
            <Card.Content>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Person</Text>
                <Text style={styles.separator}>:</Text>
                <Text style={styles.detail}>{item.person}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Purpose</Text>
                <Text style={styles.separator}>:</Text>
                <Text style={styles.detail}>{item.purpose}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.separator}>:</Text>
                <Text style={styles.detail}>{item.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Amount</Text>
                <Text style={styles.separator}>:</Text>
                <Text style={styles.detail}>₹{item.amount}</Text>
              </View>
            </Card.Content>
            <Button
              mode="outlined"
              onPress={() => showDeleteDialog(item.id)}
              style={styles.deleteButton}
            >
              <Text> Delete Expense </Text>
            </Button>
          </Card>
        ))}

        <Portal>
          <Dialog visible={visibleDialog} onDismiss={hideDeleteDialog}>
            <Dialog.Title>Confirm Deletion</Dialog.Title>
            <Dialog.Content>
              <Text>Are you sure you want to delete this expense?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDeleteDialog}>Cancel</Button>
              <Button
                onPress={() => {
                  handleDelete(expenseToDelete);
                  hideDeleteDialog();
                }}
              >
                <Text> Yes </Text>
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  input: {
    marginVertical: 10,
  },
  submitButton: {
    marginVertical: 15,
  },
  card: {
    marginVertical: 10,
    borderRadius: 10,
    elevation: 3,
  },
  formCard: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  label: {
    fontSize: 16,
    width: '40%',
    textAlign: 'left',
  },
  separator: {
    fontSize: 16,
    width: '10%',
    textAlign: 'center',
  },
  detail: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    textAlign: 'left',
  },
  deleteButton: {
    margin: 10,
    width: 230,
    alignSelf: 'center',
  },
});

export default CashOutflowForm;