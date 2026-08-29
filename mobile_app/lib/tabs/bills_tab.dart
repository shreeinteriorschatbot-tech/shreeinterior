import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';

class BillsTab extends StatefulWidget {
  const BillsTab({Key? key}) : super(key: key);

  @override
  State<BillsTab> createState() => _BillsTabState();
}

class _BillsTabState extends State<BillsTab> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _descController = TextEditingController();

  String? _selectedSiteId;
  String? _receiptBase64;
  bool _isSubmitting = false;

  final ImagePicker _picker = ImagePicker();

  Future<void> _pickReceipt(ImageSource source) async {
    try {
      final XFile? file = await _picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );
      if (file == null) return;

      // Enforce file size check (10 MB limit)
      final size = await file.length();
      if (size > 10 * 1024 * 1024) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Receipt image is too large (max 10MB)'), backgroundColor: Colors.red),
        );
        return;
      }

      final bytes = await file.readAsBytes();
      final String base64String = 'data:image/jpeg;base64,${base64Encode(bytes)}';

      setState(() {
        _receiptBase64 = base64String;
      });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Receipt captured!')));
    } catch (_) {}
  }

  Future<void> _submitBill() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedSiteId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a project site.')));
      return;
    }
    if (_receiptBase64 == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please capture the bill receipt.')));
      return;
    }

    setState(() => _isSubmitting = true);

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final data = Provider.of<DataProvider>(context, listen: false);
    final user = auth.currentUser!;
    final site = data.sites.firstWhere((s) => s.id == _selectedSiteId);

    final success = await data.submitBill(
      managerId: user.id,
      managerName: user.name,
      siteId: site.id,
      siteName: site.name,
      amount: double.tryParse(_amountController.text) ?? 0.0,
      description: _descController.text.trim(),
      photoBase64: _receiptBase64!,
    );

    setState(() => _isSubmitting = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Bill reimbursement claim uploaded!'), backgroundColor: Colors.green),
      );
      _amountController.clear();
      _descController.clear();
      setState(() {
        _receiptBase64 = null;
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to submit claim.'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _updateStatus(String billId, String status) async {
    final success = await Provider.of<DataProvider>(context, listen: false).updateBillStatus(billId, status);
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Bill marked as $status!'), backgroundColor: Colors.green),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Operation failed.'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    const goldAccent = Color(0xFFF3C65F);
    const warmWhite = Color(0xFFF9F6F0);
    const cardBg = Color(0xFF282828);

    final auth = Provider.of<AuthProvider>(context);
    final user = auth.currentUser!;
    final data = Provider.of<DataProvider>(context);

    // Active assigned sites
    final activeSites = user.role == 'Admin'
        ? data.sites.where((s) => s.status == 'Active').toList()
        : data.sites.where((s) => s.status == 'Active' && (s.managerId == user.id || s.staffIds.contains(user.id))).toList();

    if (_selectedSiteId == null && activeSites.isNotEmpty) {
      _selectedSiteId = activeSites[0].id;
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Submit claim (Managers only)
          if (user.role == 'Manager') ...[
            Container(
              decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(16)),
              padding: const EdgeInsets.all(20),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'UPLOAD REIMBURSEMENT CLAIM BILL',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: goldAccent, fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1),
                    ),
                    const SizedBox(height: 15),

                    // Select Site
                    DropdownButtonFormField<String>(
                      dropdownColor: cardBg,
                      value: _selectedSiteId,
                      style: const TextStyle(color: warmWhite, fontSize: 14),
                      decoration: const InputDecoration(
                        labelText: 'Select Project Site',
                        labelStyle: TextStyle(color: Colors.white54, fontSize: 13),
                      ),
                      items: activeSites.map((s) {
                        return DropdownMenuItem<String>(
                          value: s.id,
                          child: Text(s.name),
                        );
                      }).toList(),
                      onChanged: (val) => setState(() => _selectedSiteId = val),
                    ),
                    const SizedBox(height: 15),

                    // Amount input
                    TextFormField(
                      controller: _amountController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: warmWhite, fontSize: 14),
                      decoration: const InputDecoration(
                        labelText: 'Claim Amount (INR ₹)',
                        labelStyle: TextStyle(color: Colors.white54, fontSize: 13),
                      ),
                      validator: (value) => value == null || value.trim().isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 15),

                    // Description
                    TextFormField(
                      controller: _descController,
                      maxLines: 2,
                      style: const TextStyle(color: warmWhite, fontSize: 14),
                      decoration: const InputDecoration(
                        labelText: 'Materials details (screws, wires, primer, transport, etc.)',
                        labelStyle: TextStyle(color: Colors.white54, fontSize: 13),
                      ),
                      validator: (value) => value == null || value.trim().isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 20),

                    // Capture receipt button
                    Row(
                      children: [
                        ElevatedButton.icon(
                          onPressed: () => _pickReceipt(ImageSource.camera),
                          style: ElevatedButton.styleFrom(backgroundColor: goldAccent, foregroundColor: Colors.black),
                          icon: const Icon(Icons.receipt),
                          label: const Text('Capture Receipt'),
                        ),
                        const SizedBox(width: 12),
                        OutlinedButton.icon(
                          onPressed: () => _pickReceipt(ImageSource.gallery),
                          style: OutlinedButton.styleFrom(foregroundColor: warmWhite, side: const BorderSide(color: warmWhite)),
                          icon: const Icon(Icons.attach_file),
                          label: const Text('Attach File'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 15),

                    // Receipt Preview
                    if (_receiptBase64 != null) ...[
                      const Text('Receipt image preview:', style: TextStyle(color: goldAccent, fontSize: 11)),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: AspectRatio(
                          aspectRatio: 1.77,
                          child: Image.memory(
                            base64Decode(_receiptBase64!.split(',')[1]),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                    ],

                    // Submit claim button
                    ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitBill,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: goldAccent,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: _isSubmitting
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2))
                          : const Text('Upload Claim Report', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 25),
          ],

          // 2. Claims Logs Directory
          const Text(
            'MATERIALS CLAIMS DIRECTORY',
            style: TextStyle(color: goldAccent, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1),
          ),
          const SizedBox(height: 10),

          data.bills.isEmpty
              ? Container(
                  decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.all(20),
                  child: const Center(child: Text('No claims logs found.', style: TextStyle(color: Colors.white38, fontStyle: FontStyle.italic))),
                )
              : ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: data.bills.length,
                  itemBuilder: (context, index) {
                    final bill = data.bills[index];
                    final dt = DateTime.parse(bill.timestamp);
                    final formattedDate = DateFormat('MMMM dd, yyyy').format(dt.toLocal());

                    return Card(
                      color: cardBg,
                      margin: const EdgeInsets.only(bottom: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Header layout
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(bill.managerName, style: const TextStyle(color: warmWhite, fontWeight: FontWeight.bold)),
                                    const SizedBox(height: 2),
                                    Text(bill.siteName, style: const TextStyle(color: Colors.white30, fontSize: 10)),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: bill.status == 'Approved'
                                        ? Colors.green.withOpacity(0.2)
                                        : bill.status == 'Pending'
                                            ? goldAccent.withOpacity(0.2)
                                            : Colors.redAccent.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    bill.status,
                                    style: TextStyle(
                                      color: bill.status == 'Approved'
                                          ? Colors.green
                                          : bill.status == 'Pending'
                                              ? goldAccent
                                              : Colors.redAccent,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 10,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const Divider(color: Colors.white12, height: 20),

                            // Details text
                            Text(bill.description, style: const TextStyle(color: warmWhite, fontSize: 13, height: 1.4)),
                            const SizedBox(height: 8),

                            // Photo preview
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: AspectRatio(
                                aspectRatio: 1.77,
                                child: Image.network(
                                  bill.photoUrl,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Center(child: Icon(Icons.broken_image, color: Colors.white30)),
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),

                            // Amount and date Row
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('Amount: ₹${bill.amount.toInt()}', style: const TextStyle(color: goldAccent, fontWeight: FontWeight.bold, fontSize: 15)),
                                Text(formattedDate, style: const TextStyle(color: Colors.white30, fontSize: 10)),
                              ],
                            ),

                            // Admin Actions (Approve / Reject)
                            if (user.role == 'Admin' && bill.status == 'Pending') ...[
                              const Divider(color: Colors.white12, height: 20),
                              Row(
                                children: [
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: () => _updateStatus(bill.id, 'Approved'),
                                      style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
                                      child: const Text('Approve'),
                                    ),
                                  ),
                                  const SizedBox(width: 15),
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: () => _updateStatus(bill.id, 'Rejected'),
                                      style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white),
                                      child: const Text('Reject'),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ],
      ),
    );
  }
}
