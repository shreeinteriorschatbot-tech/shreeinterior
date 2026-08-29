import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';

class WorkDoneTab extends StatefulWidget {
  const WorkDoneTab({Key? key}) : super(key: key);

  @override
  State<WorkDoneTab> createState() => _WorkDoneTabState();
}

class _WorkDoneTabState extends State<WorkDoneTab> {
  final _formKey = GlobalKey<FormState>();
  final _descController = TextEditingController();
  final _reviewController = TextEditingController();

  String? _selectedSiteId;
  String? _imageBase64;
  bool _isSubmitting = false;

  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage(ImageSource source) async {
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
          const SnackBar(content: Text('Image file size too large (max 10MB)'), backgroundColor: Colors.red),
        );
        return;
      }

      final bytes = await file.readAsBytes();
      final String base64String = 'data:image/jpeg;base64,${base64Encode(bytes)}';

      setState(() {
        _imageBase64 = base64String;
      });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Image uploaded!')));
    } catch (_) {}
  }

  Future<void> _submitProgress() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedSiteId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a project site.')));
      return;
    }
    if (_imageBase64 == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please upload a progress photo.')));
      return;
    }

    setState(() => _isSubmitting = true);

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final data = Provider.of<DataProvider>(context, listen: false);
    final user = auth.currentUser!;
    final site = data.sites.firstWhere((s) => s.id == _selectedSiteId);

    final success = await data.submitWorkDone(
      userId: user.id,
      userName: user.name,
      role: user.role,
      siteId: site.id,
      siteName: site.name,
      photoBase64: _imageBase64!,
      description: _descController.text.trim(),
    );

    setState(() => _isSubmitting = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Progress report submitted!'), backgroundColor: Colors.green),
      );
      _descController.clear();
      setState(() {
        _imageBase64 = null;
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to submit progress.'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _submitReview(String recordId) async {
    final text = _reviewController.text.trim();
    if (text.isEmpty) return;

    final data = Provider.of<DataProvider>(context, listen: false);
    final success = await data.reviewWorkDone(recordId, text);

    if (success) {
      _reviewController.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Review comment added!'), backgroundColor: Colors.green),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to add review.'), backgroundColor: Colors.red),
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

    // Filter active assigned sites
    final activeSites = user.role == 'Admin'
        ? data.sites.where((s) => s.status == 'Active').toList()
        : data.sites.where((s) => s.status == 'Active' && (s.managerId == user.id || s.staffIds.contains(user.id))).toList();

    if (_selectedSiteId == null && activeSites.isNotEmpty) {
      _selectedSiteId = activeSites[0].id;
    }

    // Filter list entries depending on role
    final submissions = user.role == 'Staff'
        ? data.workDoneList.where((w) => w.userId == user.id).toList()
        : data.workDoneList;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Submit progress report (Staff / Managers)
          if (user.role != 'Admin') ...[
            Container(
              decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(16)),
              padding: const EdgeInsets.all(20),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'SUBMIT DAILY WORK PROGRESS',
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

                    // Description text input
                    TextFormField(
                      controller: _descController,
                      maxLines: 3,
                      style: const TextStyle(color: warmWhite, fontSize: 14),
                      decoration: const InputDecoration(
                        labelText: 'Describe completed tasks today',
                        labelStyle: TextStyle(color: Colors.white54, fontSize: 13),
                      ),
                      validator: (value) => value == null || value.trim().isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 20),

                    // Photo selector
                    Row(
                      children: [
                        ElevatedButton.icon(
                          onPressed: () => _pickImage(ImageSource.camera),
                          style: ElevatedButton.styleFrom(backgroundColor: goldAccent, foregroundColor: Colors.black),
                          icon: const Icon(Icons.camera_alt),
                          label: const Text('Capture Photo'),
                        ),
                        const SizedBox(width: 12),
                        OutlinedButton.icon(
                          onPressed: () => _pickImage(ImageSource.gallery),
                          style: OutlinedButton.styleFrom(foregroundColor: warmWhite, side: const BorderSide(color: warmWhite)),
                          icon: const Icon(Icons.photo_library),
                          label: const Text('From Gallery'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 15),

                    // Image preview
                    if (_imageBase64 != null) ...[
                      const Text('Image Selected Preview:', style: TextStyle(color: goldAccent, fontSize: 11)),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: AspectRatio(
                          aspectRatio: 1.77,
                          child: Image.memory(
                            base64Decode(_imageBase64!.split(',')[1]),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                    ],

                    // Submit trigger button
                    ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitProgress,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: goldAccent,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: _isSubmitting
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2))
                          : const Text('Submit Progress Report', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 25),
          ],

          // 2. Previous Progress Submissions list
          const Text(
            'SUBMITTED PROGRESS REPORTS DIRECTORY',
            style: TextStyle(color: goldAccent, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1),
          ),
          const SizedBox(height: 10),

          submissions.isEmpty
              ? Container(
                  decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.all(20),
                  child: const Center(child: Text('No submissions found.', style: TextStyle(color: Colors.white38, fontStyle: FontStyle.italic))),
                )
              : ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: submissions.length,
                  itemBuilder: (context, index) {
                    final report = submissions[index];
                    final dt = DateTime.parse(report.timestamp);
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
                            // Header profile
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(report.userName, style: const TextStyle(color: warmWhite, fontWeight: FontWeight.bold)),
                                    const SizedBox(height: 2),
                                    Text('${report.siteName} (${report.role})', style: const TextStyle(color: Colors.white30, fontSize: 10)),
                                  ],
                                ),
                                Text(formattedDate, style: const TextStyle(color: Colors.white30, fontSize: 11)),
                              ],
                            ),
                            const Divider(color: Colors.white12, height: 20),

                            // Work progress image
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: AspectRatio(
                                aspectRatio: 1.77,
                                child: Image.network(
                                  report.photoUrl,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Center(child: Icon(Icons.broken_image, color: Colors.white30)),
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),

                            // Description text
                            Text(
                              report.description,
                              style: const TextStyle(color: warmWhite, fontSize: 13, height: 1.4),
                            ),
                            const SizedBox(height: 10),

                            // Manager/Admin review comments list
                            if (report.reviewText != null) ...[
                              Container(
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.04),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: goldAccent.withOpacity(0.2)),
                                ),
                                padding: const EdgeInsets.all(10),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Icon(Icons.rate_review, color: goldAccent, size: 16),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        report.reviewText!,
                                        style: const TextStyle(color: goldAccent, fontSize: 11, fontStyle: FontStyle.italic),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ] else if (user.role == 'Admin' || user.role == 'Manager') ...[
                              // Review comments creation form (for Managers & Admins)
                              const Divider(color: Colors.white12),
                              Row(
                                children: [
                                  Expanded(
                                    child: TextField(
                                      controller: _reviewController,
                                      style: const TextStyle(color: warmWhite, fontSize: 12),
                                      decoration: const InputDecoration(
                                        hintText: 'Add manager review comment...',
                                        hintStyle: TextStyle(color: Colors.white24, fontSize: 11),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  IconButton(
                                    icon: const Icon(Icons.send, color: goldAccent, size: 20),
                                    onPressed: () => _submitReview(report.id),
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
