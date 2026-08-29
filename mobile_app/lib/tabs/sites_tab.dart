import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';
import '../models/site.dart';
import '../models/user.dart';

class SitesTab extends StatefulWidget {
  const SitesTab({Key? key}) : super(key: key);

  @override
  State<SitesTab> createState() => _SitesTabState();
}

class _SitesTabState extends State<SitesTab> {
  // Launch address on native map app
  Future<void> _openMapLink(double lat, double lng) async {
    final uri = Uri.parse('https://www.google.com/maps/search/?api=1&query=$lat,$lng');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  // Handle checklist item toggle check status
  Future<void> _toggleChecklistItem(Site site, ChecklistItem item, bool? checked) async {
    final data = Provider.of<DataProvider>(context, listen: false);

    // Update item status locally first
    setState(() {
      item.completed = checked ?? false;
      item.percentage = item.completed ? 100 : 0;
    });

    // Sync checklist object with backend
    final serializedList = site.checklist.map((c) => c.toJson()).toList();
    final success = await data.updateSiteChecklist(site.id, serializedList);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Updated: "${item.text}"'), backgroundColor: Colors.green, duration: const Duration(seconds: 1)),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to update. Try again.'), backgroundColor: Colors.red),
      );
      // Revert status
      setState(() {
        item.completed = !item.completed;
        item.percentage = item.completed ? 100 : 0;
      });
    }
  }

  // Open site creation screen for Admin
  void _openCreateSiteDialog() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const CreateSiteScreen()),
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

    // Filter assigned sites
    final assignedSites = user.role == 'Admin'
        ? data.sites
        : data.sites.where((s) => s.managerId == user.id || s.staffIds.contains(user.id)).toList();

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: user.role == 'Admin'
          ? FloatingActionButton(
              backgroundColor: goldAccent,
              foregroundColor: Colors.black,
              onPressed: _openCreateSiteDialog,
              child: const Icon(Icons.add),
            )
          : null,
      body: assignedSites.isEmpty
          ? const Center(
              child: Text(
                'No projects assigned.',
                style: TextStyle(color: Colors.white54, fontStyle: FontStyle.italic),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: assignedSites.length,
              itemBuilder: (context, index) {
                final site = assignedSites[index];
                final activeChecks = site.checklist.where((c) => c.completed).length;
                final totalChecks = site.checklist.length;
                final pct = totalChecks > 0 ? (activeChecks / totalChecks * 100).toInt() : 0;

                return Card(
                  color: cardBg,
                  margin: const EdgeInsets.only(bottom: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: ExpansionTile(
                    iconColor: goldAccent,
                    collapsedIconColor: warmWhite,
                    title: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            site.name,
                            style: const TextStyle(color: warmWhite, fontWeight: FontWeight.bold, fontSize: 15),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: site.status == 'Active' ? Colors.green.withOpacity(0.2) : Colors.blue.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            site.status,
                            style: TextStyle(
                              color: site.status == 'Active' ? Colors.green : Colors.blue,
                              fontWeight: FontWeight.bold,
                              fontSize: 10,
                            ),
                          ),
                        ),
                      ],
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 6),
                      child: Text(
                        'Progress: $pct% ($activeChecks/$totalChecks milestones)',
                        style: const TextStyle(color: Colors.white54, fontSize: 11),
                      ),
                    ),
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Divider(color: Colors.white12),
                            // Address Info
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.location_on, color: goldAccent, size: 16),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () => _openMapLink(site.latitude, site.longitude),
                                    child: Text(
                                      site.address,
                                      style: const TextStyle(color: warmWhite, fontSize: 12, decoration: TextDecoration.underline),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),

                            // Milestones List header
                            const Text(
                              'PROJECT CHECKLIST MILESTONES',
                              style: TextStyle(color: goldAccent, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
                            ),
                            const SizedBox(height: 5),

                            // Milestones Checklist List
                            site.checklist.isEmpty
                                ? const Padding(
                                    padding: EdgeInsets.symmetric(vertical: 10),
                                    child: Text('No milestones configured.', style: TextStyle(color: Colors.white38, fontStyle: FontStyle.italic, fontSize: 11)),
                                  )
                                : ListView.builder(
                                    shrinkWrap: true,
                                    physics: const NeverScrollableScrollPhysics(),
                                    itemCount: site.checklist.length,
                                    itemBuilder: (context, cIdx) {
                                      final checkItem = site.checklist[cIdx];
                                      return CheckboxListTile(
                                        contentPadding: EdgeInsets.zero,
                                        activeColor: goldAccent,
                                        checkColor: Colors.black,
                                        title: Text(
                                          checkItem.text,
                                          style: TextStyle(
                                            color: checkItem.completed ? Colors.white38 : warmWhite,
                                            decoration: checkItem.completed ? TextDecoration.lineThrough : null,
                                            fontSize: 13,
                                          ),
                                        ),
                                        subtitle: checkItem.description.isNotEmpty
                                            ? Text(checkItem.description, style: const TextStyle(color: Colors.white30, fontSize: 10))
                                            : null,
                                        value: checkItem.completed,
                                        onChanged: (val) => _toggleChecklistItem(site, checkItem, val),
                                      );
                                    },
                                  ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}

// Dialog screen to create a new site for Admin
class CreateSiteScreen extends StatefulWidget {
  const CreateSiteScreen({Key? key}) : super(key: key);

  @override
  State<CreateSiteScreen> createState() => _CreateSiteScreenState();
}

class _CreateSiteScreenState extends State<CreateSiteScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _addressController = TextEditingController();
  final _latController = TextEditingController(text: '13.0418');
  final _lngController = TextEditingController(text: '80.2341');

  String? _selectedManagerId;
  final List<String> _selectedStaffIds = [];
  final List<String> _checklistItems = [];
  final _checklistInputController = TextEditingController();
  bool _isLoading = false;

  void _addChecklistItem() {
    final text = _checklistInputController.text.trim();
    if (text.isNotEmpty) {
      setState(() {
        _checklistItems.add(text);
        _checklistInputController.clear();
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedManagerId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a manager.')));
      return;
    }
    if (_checklistItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please add at least one milestone.')));
      return;
    }

    setState(() => _isLoading = true);

    // Build checklist format
    final finalChecklist = _checklistItems.asMap().entries.map((entry) {
      return {
        'id': 'chk-${entry.key + 1}',
        'text': entry.value,
        'completed': false,
        'percentage': 0,
        'description': '',
      };
    }).toList();

    final success = await Provider.of<DataProvider>(context, listen: false).createSite(
      name: _nameController.text.trim(),
      address: _addressController.text.trim(),
      latitude: double.tryParse(_latController.text) ?? 13.0418,
      longitude: double.tryParse(_lngController.text) ?? 80.2341,
      managerId: _selectedManagerId!,
      staffIds: _selectedStaffIds,
      checklist: finalChecklist,
    );

    setState(() => _isLoading = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Project created successfully!'), backgroundColor: Colors.green));
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to create project.'), backgroundColor: Colors.red));
    }
  }

  @override
  Widget build(BuildContext context) {
    const charcoal = Color(0xFF1E1E1E);
    const goldAccent = Color(0xFFF3C65F);
    const warmWhite = Color(0xFFF9F6F0);
    const cardBg = Color(0xFF282828);

    final data = Provider.of<DataProvider>(context);
    final managers = data.users.where((u) => u.role == 'Manager').toList();
    final staff = data.users.where((u) => u.role == 'Staff').toList();

    return Scaffold(
      backgroundColor: charcoal,
      appBar: AppBar(
        backgroundColor: charcoal,
        title: const Text('Create New Project'),
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
                    TextFormField(
                      controller: _nameController,
                      style: const TextStyle(color: warmWhite),
                      decoration: const InputDecoration(labelText: 'Project Name', labelStyle: TextStyle(color: Colors.white60)),
                      validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _addressController,
                      style: const TextStyle(color: warmWhite),
                      decoration: const InputDecoration(labelText: 'Address Location', labelStyle: TextStyle(color: Colors.white60)),
                      validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _latController,
                            keyboardType: TextInputType.number,
                            style: const TextStyle(color: warmWhite),
                            decoration: const InputDecoration(labelText: 'Latitude', labelStyle: TextStyle(color: Colors.white60)),
                            validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                          ),
                        ),
                        const SizedBox(width: 15),
                        Expanded(
                          child: TextFormField(
                            controller: _lngController,
                            keyboardType: TextInputType.number,
                            style: const TextStyle(color: warmWhite),
                            decoration: const InputDecoration(labelText: 'Longitude', labelStyle: TextStyle(color: Colors.white60)),
                            validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Manager Dropdown Select
                    DropdownButtonFormField<String>(
                      dropdownColor: cardBg,
                      value: _selectedManagerId,
                      style: const TextStyle(color: warmWhite),
                      decoration: const InputDecoration(labelText: 'Assigned Project Manager', labelStyle: TextStyle(color: Colors.white60)),
                      items: managers.map((m) {
                        return DropdownMenuItem<String>(
                          value: m.id,
                          child: Text(m.name),
                        );
                      }).toList(),
                      onChanged: (val) => setState(() => _selectedManagerId = val),
                    ),
                    const SizedBox(height: 20),

                    // Staff selection header
                    const Text('ASSIGN FIELD STAFF ENGINEERS', style: TextStyle(color: goldAccent, fontWeight: FontWeight.bold, fontSize: 11)),
                    const SizedBox(height: 8),
                    Container(
                      decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(10)),
                      child: ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: staff.length,
                        itemBuilder: (context, index) {
                          final st = staff[index];
                          final isAssigned = _selectedStaffIds.contains(st.id);
                          return CheckboxListTile(
                            activeColor: goldAccent,
                            checkColor: Colors.black,
                            title: Text(st.name, style: const TextStyle(color: warmWhite, fontSize: 13)),
                            value: isAssigned,
                            onChanged: (val) {
                              setState(() {
                                if (val == true) {
                                  _selectedStaffIds.add(st.id);
                                } else {
                                  _selectedStaffIds.remove(st.id);
                                }
                              });
                            },
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 25),

                    // Checklist building header
                    const Text('ADD CHECKLIST MILESTONES', style: TextStyle(color: goldAccent, fontWeight: FontWeight.bold, fontSize: 11)),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _checklistInputController,
                            style: const TextStyle(color: warmWhite),
                            decoration: const InputDecoration(
                              hintText: 'e.g. Living Room Wiring framework',
                              hintStyle: TextStyle(color: Colors.white24, fontSize: 13),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        IconButton(
                          icon: const Icon(Icons.add_circle, color: goldAccent, size: 28),
                          onPressed: _addChecklistItem,
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    // List of added checklist items
                    Container(
                      decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.all(12),
                      child: _checklistItems.isEmpty
                          ? const Center(child: Text('No milestones added yet.', style: TextStyle(color: Colors.white24, fontSize: 12, fontStyle: FontStyle.italic)))
                          : Column(
                              children: _checklistItems.asMap().entries.map((entry) {
                                return ListTile(
                                  contentPadding: EdgeInsets.zero,
                                  leading: CircleAvatar(
                                    backgroundColor: Colors.white10,
                                    radius: 12,
                                    child: Text('${entry.key + 1}', style: const TextStyle(color: warmWhite, fontSize: 11)),
                                  ),
                                  title: Text(entry.value, style: const TextStyle(color: warmWhite, fontSize: 13)),
                                  trailing: IconButton(
                                    icon: const Icon(Icons.remove_circle_outline, color: Colors.redAccent, size: 18),
                                    onPressed: () => setState(() => _checklistItems.removeAt(entry.key)),
                                  ),
                                );
                              }).toList(),
                            ),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
    );
  }
}
