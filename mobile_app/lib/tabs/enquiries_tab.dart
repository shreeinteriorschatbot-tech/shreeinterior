import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/data_provider.dart';
import '../models/enquiry.dart';

class EnquiriesTab extends StatefulWidget {
  const EnquiriesTab({Key? key}) : super(key: key);

  @override
  State<EnquiriesTab> createState() => _EnquiriesTabState();
}

class _EnquiriesTabState extends State<EnquiriesTab> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    const goldAccent = Color(0xFFF3C65F);
    const warmWhite = Color(0xFFF9F6F0);
    const cardBg = Color(0xFF282828);

    final data = Provider.of<DataProvider>(context);

    final filteredEnquiries = data.enquiries.where((e) {
      final q = _searchQuery.toLowerCase();
      return e.name.toLowerCase().contains(q) ||
          e.email.toLowerCase().contains(q) ||
          e.phone.contains(q) ||
          e.message.toLowerCase().contains(q);
    }).toList();

    return Column(
      children: [
        // Search bar
        Padding(
          padding: const EdgeInsets.all(12),
          child: TextField(
            controller: _searchController,
            style: const TextStyle(color: warmWhite),
            decoration: InputDecoration(
              labelText: 'Search enquiries...',
              labelStyle: const TextStyle(color: Colors.white54),
              prefixIcon: const Icon(Icons.search, color: goldAccent),
              filled: true,
              fillColor: cardBg,
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: goldAccent),
              ),
            ),
            onChanged: (val) {
              setState(() {
                _searchQuery = val;
              });
            },
          ),
        ),

        // List viewport
        Expanded(
          child: filteredEnquiries.isEmpty
              ? const Center(
                  child: Text(
                    'No consultation enquiries found.',
                    style: TextStyle(color: Colors.white24, fontStyle: FontStyle.italic, fontSize: 13),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  itemCount: filteredEnquiries.length,
                  itemBuilder: (context, index) {
                    final enq = filteredEnquiries[index];
                    final dt = DateTime.parse(enq.timestamp);
                    final formattedDate = DateFormat('MMMM dd, yyyy').format(dt.toLocal());
                    final formattedTime = DateFormat('jm').format(dt.toLocal());

                    return Card(
                      color: cardBg,
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Header name and timestamp
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.person, color: goldAccent, size: 18),
                                    const SizedBox(width: 8),
                                    Text(
                                      enq.name,
                                      style: const TextStyle(color: warmWhite, fontWeight: FontWeight.bold, fontSize: 14),
                                    ),
                                  ],
                                ),
                                Text(
                                  formattedDate,
                                  style: const TextStyle(color: Colors.white30, fontSize: 10),
                                ),
                              ],
                            ),
                            const Divider(color: Colors.white12, height: 20),

                            // Contact info
                            Row(
                              children: [
                                const Icon(Icons.email, color: goldAccent, size: 14),
                                const SizedBox(width: 8),
                                Text(enq.email, style: const TextStyle(color: Colors.white54, fontSize: 12)),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                const Icon(Icons.phone, color: goldAccent, size: 14),
                                const SizedBox(width: 8),
                                Text(enq.phone, style: const TextStyle(color: Colors.white54, fontSize: 12)),
                              ],
                            ),
                            const SizedBox(height: 12),

                            // Message box
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.02),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.white10),
                              ),
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: const [
                                      Icon(Icons.message, color: goldAccent, size: 12),
                                      SizedBox(width: 6),
                                      Text(
                                        'ENQUIRY MESSAGE',
                                        style: TextStyle(color: goldAccent, fontSize: 9, fontWeight: FontWeight.bold),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    enq.message,
                                    style: const TextStyle(color: warmWhite, fontSize: 12, height: 1.4),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
