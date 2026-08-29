import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';

// Import tab screens
import '../tabs/overview_tab.dart';
import '../tabs/sites_tab.dart';
import '../tabs/attendance_tab.dart';
import '../tabs/work_done_tab.dart';
import '../tabs/bills_tab.dart';
import '../tabs/payments_tab.dart';
import '../tabs/chat_tab.dart';
import '../tabs/settings_tab.dart';
import '../tabs/enquiries_tab.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  String _activeTab = 'Overview';

  @override
  void initState() {
    super.initState();
    // Load initial data from MongoDB Atlas
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<DataProvider>(context, listen: false).fetchAllData();
    });
  }

  Widget _buildBody(String role) {
    switch (_activeTab) {
      case 'Overview':
        return const OverviewTab();
      case 'Sites':
        return const SitesTab();
      case 'Attendance':
        return const AttendanceTab();
      case 'Work Done':
        return const WorkDoneTab();
      case 'Bills Claims':
        return const BillsTab();
      case 'Payments':
        return const PaymentsTab();
      case 'Internal Messages':
        return const ChatTab();
      case 'Customer Enquiries':
        return const EnquiriesTab();
      case 'Account Settings':
        return const SettingsTab();
      default:
        return const OverviewTab();
    }
  }

  List<Map<String, dynamic>> _getMenuItems(String role) {
    final List<Map<String, dynamic>> items = [
      {'id': 'Overview', 'label': 'Overview', 'icon': Icons.dashboard},
      {'id': 'Sites', 'label': 'Sites', 'icon': Icons.map},
      {'id': 'Attendance', 'label': 'Attendance', 'icon': Icons.alarm},
      {'id': 'Work Done', 'label': 'Work Done Submissions', 'icon': Icons.assignment},
    ];

    if (role == 'Admin' || role == 'Manager') {
      items.add({'id': 'Bills Claims', 'label': 'Bills Claims', 'icon': Icons.receipt_long});
    }
    if (role == 'Admin') {
      items.add({'id': 'Payments', 'label': 'Payments Tracker', 'icon': Icons.payments});
      items.add({'id': 'Customer Enquiries', 'label': 'Customer Enquiries', 'icon': Icons.mail});
    }

    items.add({'id': 'Internal Messages', 'label': 'Internal Messages', 'icon': Icons.chat});
    items.add({'id': 'Account Settings', 'label': 'Account Settings', 'icon': Icons.settings});

    return items;
  }

  @override
  Widget build(BuildContext context) {
    const charcoal = Color(0xFF1E1E1E);
    const goldAccent = Color(0xFFF3C65F);
    const warmWhite = Color(0xFFF9F6F0);
    const cardBg = Color(0xFF282828);

    final auth = Provider.of<AuthProvider>(context);
    final user = auth.currentUser;
    if (user == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final menuItems = _getMenuItems(user.role);
    final data = Provider.of<DataProvider>(context);

    return Scaffold(
      backgroundColor: charcoal,
      appBar: AppBar(
        backgroundColor: charcoal,
        elevation: 0.5,
        title: Text(
          _activeTab,
          style: const TextStyle(color: warmWhite, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: goldAccent),
            onPressed: () => data.fetchAllData(),
          ),
        ],
      ),
      drawer: Drawer(
        backgroundColor: charcoal,
        child: Column(
          children: [
            // Drawer Header
            UserAccountsDrawerHeader(
              decoration: const BoxDecoration(color: cardBg),
              currentAccountPicture: CircleAvatar(
                backgroundColor: goldAccent,
                child: Text(
                  user.name.split(' ').map((n) => n[0]).join(''),
                  style: const TextStyle(color: charcoal, fontWeight: FontWeight.bold, fontSize: 20),
                ),
              ),
              accountName: Text(user.name, style: const TextStyle(color: warmWhite, fontWeight: FontWeight.bold)),
              accountEmail: Row(
                children: [
                  const Icon(Icons.verified_user, color: goldAccent, size: 14),
                  const SizedBox(width: 4),
                  Text(
                    user.role == 'Admin' ? 'Founder Admin' : user.role,
                    style: const TextStyle(color: goldAccent, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),

            // Navigation Items List
            Expanded(
              child: ListView.builder(
                padding: EdgeInsets.zero,
                itemCount: menuItems.length,
                itemBuilder: (context, index) {
                  final item = menuItems[index];
                  final isSelected = _activeTab == item['id'];
                  return ListTile(
                    leading: Icon(
                      item['icon'],
                      color: isSelected ? charcoal : goldAccent,
                    ),
                    title: Text(
                      item['label'],
                      style: TextStyle(
                        color: isSelected ? charcoal : warmWhite,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                    tileColor: isSelected ? goldAccent : null,
                    onTap: () {
                      setState(() => _activeTab = item['id']);
                      Navigator.pop(context);
                    },
                  );
                },
              ),
            ),

            // Logout Option
            const Divider(color: Colors.white24),
            ListTile(
              leading: const Icon(Icons.exit_to_app, color: Colors.redAccent),
              title: const Text('Sign Out', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
              onTap: () async {
                await auth.logout();
                Navigator.pushReplacementNamed(context, '/');
              },
            ),
            const SizedBox(height: 15),
          ],
        ),
      ),
      body: _isLoadingData(data)
          ? const Center(child: CircularProgressIndicator(color: goldAccent))
          : _buildBody(user.role),
    );
  }

  bool _isLoadingData(DataProvider data) {
    // Show spinner if fetching data for first time and cache is empty
    return data.isLoading && data.sites.isEmpty && data.users.isEmpty;
  }
}
