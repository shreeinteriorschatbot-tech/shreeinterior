import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';
import '../models/user.dart';

class PaymentsTab extends StatefulWidget {
  const PaymentsTab({Key? key}) : super(key: key);

  @override
  State<PaymentsTab> createState() => _PaymentsTabState();
}

class _PaymentsTabState extends State<PaymentsTab> {
  void _openAddPaymentDialog() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const AddPaymentScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    const goldAccent = Color(0xFFF3C65F);
    const warmWhite = Color(0xFFF9F6F0);
    const cardBg = Color(0xFF282828);

    final auth = Provider.of<AuthProvider>(context);
    final user = auth.currentUser!;
    final data = Provider.of<DataProvider>(context);

    // List payments (Admins see all, Managers/Staff see their own payments)
    final filteredPayments = user.role == 'Admin'
        ? data.payments
        : data.payments.where((p) => p.userId == user.id).toList();

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: user.role == 'Admin'
          ? FloatingActionButton(
              backgroundColor: goldAccent,
              foregroundColor: Colors.black,
              onPressed: _openAddPaymentDialog,
              child: const Icon(Icons.add),
            )
          : null,
      body: filteredPayments.isEmpty
          ? const Center(
              child: Text(
                'No payment records found.',
                style: TextStyle(color: Colors.white54, fontStyle: FontStyle.italic),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: filteredPayments.length,
              itemBuilder: (context, index) {
                final payment = filteredPayments[index];
                final dt = DateTime.parse(payment.dateUpdated);
                final formattedDate = DateFormat('MMMM dd, yyyy').format(dt.toLocal());

                return Card(
                  color: cardBg,
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(payment.userName, style: const TextStyle(color: warmWhite, fontWeight: FontWeight.bold)),
                                const SizedBox(height: 2),
                                Text('${payment.type} Log (${payment.role})', style: const TextStyle(color: Colors.white30, fontSize: 10)),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: payment.status == 'Paid' ? Colors.green.withOpacity(0.2) : goldAccent.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                payment.status,
                                style: TextStyle(
                                  color: payment.status == 'Paid' ? Colors.green : goldAccent,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 10,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const Divider(color: Colors.white12, height: 20),
                        Text(payment.description, style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4)),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Amount: ₹${payment.amount.toInt()}', style: const TextStyle(color: goldAccent, fontWeight: FontWeight.bold, fontSize: 16)),
                            Text(formattedDate, style: const TextStyle(color: Colors.white30, fontSize: 10)),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}

class AddPaymentScreen extends StatefulWidget {
  const AddPaymentScreen({Key? key}) : super(key: key);

  @override
  State<AddPaymentScreen> createState() => _AddPaymentScreenState();
}

class _AddPaymentScreenState extends State<AddPaymentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _descController = TextEditingController();

  String _selectedType = 'Salary';
  String _selectedStatus = 'Paid';
  String? _selectedUserId;
  bool _isLoading = false;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedUserId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a recipient employee.')));
      return;
    }

    setState(() => _isLoading = true);

    final data = Provider.of<DataProvider>(context, listen: false);
    final targetUser = data.users.firstWhere((u) => u.id == _selectedUserId);

    final success = await data.addPayment(
      type: _selectedType,
      userId: targetUser.id,
      userName: targetUser.name,
      role: targetUser.role,
      amount: double.tryParse(_amountController.text) ?? 0.0,
      status: _selectedStatus,
      description: _descController.text.trim(),
    );

    setState(() => _isLoading = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payment ledger log added!'), backgroundColor: Colors.green));
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to log payment.'), backgroundColor: Colors.red));
    }
  }

  @override
  Widget build(BuildContext context) {
    const charcoal = Color(0xFF1E1E1E);
    const goldAccent = Color(0xFFF3C65F);
    const warmWhite = Color(0xFFF9F6F0);
    const cardBg = Color(0xFF282828);

    final data = Provider.of<DataProvider>(context);
    final eligibleUsers = data.users.where((u) => u.role != 'Admin').toList();

    return Scaffold(
      backgroundColor: charcoal,
      appBar: AppBar(
        backgroundColor: charcoal,
        title: const Text('Add Payment Log'),
        actions: [
          IconButton(
            icon: const Icon(Icons.check, color: goldAccent),
            onPressed: _isLoading ? null : _submit,
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: goldAccent))
          : Form(
              key: _formKey,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Payee user select
                    DropdownButtonFormField<String>(
                      dropdownColor: cardBg,
                      value: _selectedUserId,
                      style: const TextStyle(color: warmWhite),
                      decoration: const InputDecoration(labelText: 'Select Recipient Employee', labelStyle: TextStyle(color: Colors.white60)),
                      items: eligibleUsers.map((u) {
                        return DropdownMenuItem<String>(
                          value: u.id,
                          child: Text('${u.name} (${u.role})'),
                        );
                      }).toList(),
                      onChanged: (val) => setState(() => _selectedUserId = val),
                    ),
                    const SizedBox(height: 15),

                    // Payment type select
                    DropdownButtonFormField<String>(
                      dropdownColor: cardBg,
                      value: _selectedType,
                      style: const TextStyle(color: warmWhite),
                      decoration: const InputDecoration(labelText: 'Payment Log Type', labelStyle: TextStyle(color: Colors.white60)),
                      items: const [
                        DropdownMenuItem(value: 'Salary', child: Text('Salary Disbursement')),
                        DropdownMenuItem(value: 'Bill', child: Text('Bill Reimbursement')),
                      ],
                      onChanged: (val) => setState(() => _selectedType = val ?? 'Salary'),
                    ),
                    const SizedBox(height: 15),

                    // Status select
                    DropdownButtonFormField<String>(
                      dropdownColor: cardBg,
                      value: _selectedStatus,
                      style: const TextStyle(color: warmWhite),
                      decoration: const InputDecoration(labelText: 'Status', labelStyle: TextStyle(color: Colors.white60)),
                      items: const [
                        DropdownMenuItem(value: 'Paid', child: Text('Paid')),
                        DropdownMenuItem(value: 'Pending', child: Text('Pending')),
                      ],
                      onChanged: (val) => setState(() => _selectedStatus = val ?? 'Paid'),
                    ),
                    const SizedBox(height: 15),

                    // Amount input
                    TextFormField(
                      controller: _amountController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: warmWhite),
                      decoration: const InputDecoration(labelText: 'Amount (INR ₹)', labelStyle: TextStyle(color: Colors.white60)),
                      validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 15),

                    // Description input
                    TextFormField(
                      controller: _descController,
                      maxLines: 2,
                      style: const TextStyle(color: warmWhite),
                      decoration: const InputDecoration(labelText: 'Description note', labelStyle: TextStyle(color: Colors.white60)),
                      validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
    );
  }
}
