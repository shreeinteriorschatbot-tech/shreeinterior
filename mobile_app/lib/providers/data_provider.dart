import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/user.dart';
import '../models/site.dart';
import '../models/attendance.dart';
import '../models/bill.dart';
import '../models/payment.dart';
import '../models/work_done.dart';
import '../models/chat.dart';
import '../models/enquiry.dart';
import '../services/api_service.dart';

class DataProvider with ChangeNotifier {
  List<User> _users = [];
  List<Site> _sites = [];
  List<Attendance> _attendanceLogs = [];
  List<Bill> _bills = [];
  List<Payment> _payments = [];
  List<WorkDone> _workDoneList = [];
  List<ChatMessage> _chatMessages = [];
  List<Enquiry> _enquiries = [];
  bool _isLoading = false;

  List<User> get users => _users;
  List<Site> get sites => _sites;
  List<Attendance> get attendanceLogs => _attendanceLogs;
  List<Bill> get bills => _bills;
  List<Payment> get payments => _payments;
  List<WorkDone> get workDoneList => _workDoneList;
  List<ChatMessage> get chatMessages => _chatMessages;
  List<Enquiry> get enquiries => _enquiries;
  bool get isLoading => _isLoading;

  DataProvider() {
    _loadDemoData();
  }

  void _loadDemoData() {
    _sites = [
      Site(
        id: 'site-1',
        name: 'T-Nagar Residential Penthouse',
        address: 'No 15, G.N. Chetty Road, T-Nagar, Chennai - 600017',
        latitude: 13.0418,
        longitude: 80.2341,
        gmapLink: 'https://maps.google.com/?q=13.0418,80.2341',
        startDate: '2026-08-10',
        status: 'Active',
        managerId: 'usr-mgr1',
        staffIds: ['usr-staff1', 'usr-staff2'],
        checklist: [
          ChecklistItem(id: 'chk-1-1', text: 'Modular Kitchen Cabinet Installation', completed: true, percentage: 100, description: 'All base and wall cabinets mounted successfully.'),
          ChecklistItem(id: 'chk-1-2', text: 'Living Room False Ceiling Framework', completed: true, percentage: 100, description: 'Metal framing is ready.'),
          ChecklistItem(id: 'chk-1-3', text: 'False Ceiling Gypsum Boarding & Wiring', completed: false, percentage: 65, description: 'Wiring pulled. Gypsum boarding is currently underway.'),
          ChecklistItem(id: 'chk-1-4', text: 'Master Bedroom Wardrobe Construction', completed: false, percentage: 20, description: 'Ply board cutting started.'),
        ],
      ),
      Site(
        id: 'site-2',
        name: 'Adyar Office Space Design',
        address: '3rd Floor, LB Road, Adyar, Chennai - 600020',
        latitude: 12.9975,
        longitude: 80.2520,
        gmapLink: 'https://maps.google.com/?q=12.9975,80.2520',
        startDate: '2026-08-15',
        status: 'Active',
        managerId: 'usr-mgr2',
        staffIds: ['usr-staff2'],
        checklist: [
          ChecklistItem(id: 'chk-2-1', text: 'Glass Partition Installations', completed: false, percentage: 40, description: 'Channel frames completed. Awaiting glass panes delivery.'),
          ChecklistItem(id: 'chk-2-2', text: 'Reception Desk Carpentry', completed: true, percentage: 100, description: 'Polishing completed.'),
        ],
      ),
      Site(
        id: 'site-3',
        name: 'Anna Nagar Villa Renovation',
        address: 'Block Y, 5th Avenue, Anna Nagar, Chennai - 600040',
        latitude: 13.0850,
        longitude: 80.2101,
        gmapLink: 'https://maps.google.com/?q=13.0850,80.2101',
        startDate: '2026-06-01',
        status: 'Completed',
        managerId: 'usr-mgr1',
        staffIds: ['usr-staff1'],
        checklist: [
          ChecklistItem(id: 'chk-3-1', text: 'Whole House Painting & Deco', completed: true, percentage: 100, description: 'Final coat finished. Client signed off.'),
          ChecklistItem(id: 'chk-3-2', text: 'Lighting Fixtures Setup', completed: true, percentage: 100, description: 'LED spotlights and central chandelier installed.'),
        ],
      ),
    ];

    _attendanceLogs = [
      Attendance(id: 'att-1', userId: 'usr-mgr1', userName: 'Rajesh Kumar', role: 'Manager', siteId: 'site-1', siteName: 'T-Nagar Residential Penthouse', type: 'In', timestamp: '2026-08-28T09:15:00Z', latitude: 13.0419, longitude: 80.2340, isSimulated: false, distance: 15),
      Attendance(id: 'att-2', userId: 'usr-staff1', userName: 'Suresh Pillai', role: 'Staff', siteId: 'site-1', siteName: 'T-Nagar Residential Penthouse', type: 'In', timestamp: '2026-08-28T09:30:00Z', latitude: 13.0418, longitude: 80.2342, isSimulated: false, distance: 10),
      Attendance(id: 'att-3', userId: 'usr-staff2', userName: 'Karthik S', role: 'Staff', siteId: 'site-1', siteName: 'T-Nagar Residential Penthouse', type: 'In', timestamp: '2026-08-28T09:40:00Z', latitude: 13.0418, longitude: 80.2341, isSimulated: true, distance: 0),
    ];

    _bills = [
      Bill(id: 'bill-1', managerId: 'usr-mgr1', managerName: 'Rajesh Kumar', siteId: 'site-1', siteName: 'T-Nagar Residential Penthouse', amount: 4500.0, description: 'Purchased extra wiring boxes and screws from local hardware store.', status: 'Approved', timestamp: '2026-08-27T17:30:00Z', photoUrl: 'https://res.cloudinary.com/demo/image/upload/v1580977265/sample.jpg'),
      Bill(id: 'bill-2', managerId: 'usr-mgr1', managerName: 'Rajesh Kumar', siteId: 'site-1', siteName: 'T-Nagar Residential Penthouse', amount: 12500.0, description: 'Gypsum Board panels (25 sheets) urgent delivery.', status: 'Pending', timestamp: '2026-08-28T11:00:00Z', photoUrl: 'https://res.cloudinary.com/demo/image/upload/v1580977265/sample.jpg'),
    ];

    _payments = [
      Payment(id: 'pay-1', type: 'Salary', userId: 'usr-mgr1', userName: 'Rajesh Kumar', role: 'Manager', amount: 35000.0, status: 'Paid', description: 'Monthly Salary - July 2026', dateUpdated: '2026-08-05'),
      Payment(id: 'pay-2', type: 'Salary', userId: 'usr-staff1', userName: 'Suresh Pillai', role: 'Staff', amount: 18000.0, status: 'Paid', description: 'Monthly Salary - July 2026', dateUpdated: '2026-08-05'),
      Payment(id: 'pay-3', type: 'Bill', userId: 'usr-mgr1', userName: 'Rajesh Kumar', role: 'Manager', billId: 'bill-1', amount: 4500.0, status: 'Paid', description: 'Hardware materials reimbursement', dateUpdated: '2026-08-28'),
      Payment(id: 'pay-4', type: 'Salary', userId: 'usr-staff2', userName: 'Karthik S', role: 'Staff', amount: 18000.0, status: 'Pending', description: 'Advance payment request', dateUpdated: '2026-08-28'),
    ];

    _chatMessages = [
      ChatMessage(id: 'msg-1', senderId: 'usr-staff1', senderName: 'Suresh Pillai', senderRole: 'Staff', recipientId: 'usr-mgr1', recipientName: 'Rajesh Kumar', text: 'Sir, paint stock is running low at T-Nagar site. We need primer tomorrow morning.', timestamp: '2026-08-28T10:00:00Z', isAdminOnly: false),
    ];
  }

  // Sync / Fetch everything in parallel
  Future<void> fetchAllData() async {
    _isLoading = true;
    notifyListeners();

    try {
      final futures = await Future.wait([
        ApiService.get('/api/users'),
        ApiService.get('/api/sites'),
        ApiService.get('/api/attendance'),
        ApiService.get('/api/bills'),
        ApiService.get('/api/payments'),
        ApiService.get('/api/workdone'),
        ApiService.get('/api/chat'),
        ApiService.get('/api/contact'),
      ]);

      if (futures[0].statusCode == 200) {
        final List fetched = jsonDecode(futures[0].body);
        if (fetched.isNotEmpty) {
          _users = fetched.map((e) => User.fromJson(e)).toList();
        }
      }
      if (futures[1].statusCode == 200) {
        final List fetched = jsonDecode(futures[1].body);
        if (fetched.isNotEmpty) {
          _sites = fetched.map((e) => Site.fromJson(e)).toList();
        }
      }
      if (futures[2].statusCode == 200) {
        final List fetched = jsonDecode(futures[2].body);
        if (fetched.isNotEmpty) {
          _attendanceLogs = fetched.map((e) => Attendance.fromJson(e)).toList();
        }
      }
      if (futures[3].statusCode == 200) {
        final List fetched = jsonDecode(futures[3].body);
        if (fetched.isNotEmpty) {
          _bills = fetched.map((e) => Bill.fromJson(e)).toList();
        }
      }
      if (futures[4].statusCode == 200) {
        final List fetched = jsonDecode(futures[4].body);
        if (fetched.isNotEmpty) {
          _payments = fetched.map((e) => Payment.fromJson(e)).toList();
        }
      }
      if (futures[5].statusCode == 200) {
        final List fetched = jsonDecode(futures[5].body);
        if (fetched.isNotEmpty) {
          _workDoneList = fetched.map((e) => WorkDone.fromJson(e)).toList();
        }
      }
      if (futures[6].statusCode == 200) {
        final List fetched = jsonDecode(futures[6].body);
        if (fetched.isNotEmpty) {
          _chatMessages = fetched.map((e) => ChatMessage.fromJson(e)).toList();
        }
      }
      if (futures[7].statusCode == 200) {
        final List fetched = jsonDecode(futures[7].body);
        if (fetched.isNotEmpty) {
          _enquiries = fetched.map((e) => Enquiry.fromJson(e)).toList();
        }
      }
    } catch (e, stack) {
      print("DataProvider fetchAllData error: $e");
      print(stack);
    }

    _isLoading = false;
    notifyListeners();
  }

  // --- SITES ---
  Future<bool> createSite({
    required String name,
    required String address,
    required double latitude,
    required double longitude,
    required String managerId,
    required List<String> staffIds,
    required List<Map<String, dynamic>> checklist,
  }) async {
    try {
      final res = await ApiService.post('/api/sites', {
        'name': name,
        'address': address,
        'latitude': latitude,
        'longitude': longitude,
        'managerId': managerId,
        'staffIds': staffIds,
        'checklist': checklist,
      });
      if (res.statusCode == 200) {
        await fetchAllData();
        return true;
      }
    } catch (_) {}
    return false;
  }

  Future<bool> updateSiteChecklist(String siteId, List<Map<String, dynamic>> checklist) async {
    try {
      final res = await ApiService.put('/api/sites/$siteId', {
        'checklist': checklist,
      });
      if (res.statusCode == 200) {
        await fetchAllData();
        return true;
      }
    } catch (_) {}
    return false;
  }

  Future<bool> completeSite(String siteId) async {
    try {
      final res = await ApiService.put('/api/sites/$siteId', {
        'status': 'Completed',
      });
      if (res.statusCode == 200) {
        await fetchAllData();
        return true;
      }
    } catch (_) {}
    return false;
  }

  // --- ATTENDANCE ---
  Future<bool> punchAttendance({
    required String userId,
    required String userName,
    required String role,
    required String siteId,
    required String siteName,
    required String type, // 'In', 'Out'
    required double latitude,
    required double longitude,
    required bool isSimulated,
    required int distance,
  }) async {
    try {
      final res = await ApiService.post('/api/attendance', {
        'userId': userId,
        'userName': userName,
        'role': role,
        'siteId': siteId,
        'siteName': siteName,
        'type': type,
        'latitude': latitude,
        'longitude': longitude,
        'isSimulated': isSimulated,
        'distance': distance,
      });
      if (res.statusCode == 200) {
        await fetchAllData();
        return true;
      }
    } catch (_) {}
    return false;
  }

  // --- WORK DONE SUBMISSIONS ---
  Future<bool> submitWorkDone({
    required String userId,
    required String userName,
    required String role,
    required String siteId,
    required String siteName,
    required String photoBase64,
    required String description,
  }) async {
    try {
      final res = await ApiService.post('/api/workdone', {
        'userId': userId,
        'userName': userName,
        'role': role,
        'siteId': siteId,
        'siteName': siteName,
        'photoUrl': photoBase64, // backend converts to Cloudinary
        'description': description,
      });
      if (res.statusCode == 200) {
        await fetchAllData();
        return true;
      }
    } catch (_) {}
    return false;
  }

  Future<bool> reviewWorkDone(String recordId, String reviewText) async {
    try {
      final res = await ApiService.put('/api/workdone/$recordId/review', {
        'reviewText': reviewText,
      });
      if (res.statusCode == 200) {
        await fetchAllData();
        return true;
      }
    } catch (_) {}
    return false;
  }

  // --- BILLS CLAIMS ---
  Future<bool> submitBill({
    required String managerId,
    required String managerName,
    required String siteId,
    required String siteName,
    required double amount,
    required String description,
    required String photoBase64,
  }) async {
    try {
      final res = await ApiService.post('/api/bills', {
        'managerId': managerId,
        'managerName': managerName,
        'siteId': siteId,
        'siteName': siteName,
        'amount': amount,
        'description': description,
        'photoUrl': photoBase64,
      });
      if (res.statusCode == 200) {
        await fetchAllData();
        return true;
      }
    } catch (_) {}
    return false;
  }

  Future<bool> updateBillStatus(String billId, String status) async {
    try {
      final res = await ApiService.put('/api/bills/$billId/review', {
        'status': status,
      });
      if (res.statusCode == 200) {
        await fetchAllData();
        return true;
      }
    } catch (_) {}
    return false;
  }

  // --- PAYMENTS ---
  Future<bool> addPayment({
    required String type,
    required String userId,
    required String userName,
    required String role,
    String? billId,
    required double amount,
    required String status,
    required String description,
  }) async {
    try {
      final res = await ApiService.post('/api/payments', {
        'type': type,
        'userId': userId,
        'userName': userName,
        'role': role,
        'billId': billId,
        'amount': amount,
        'status': status,
        'description': description,
      });
      if (res.statusCode == 200) {
        await fetchAllData();
        return true;
      }
    } catch (_) {}
    return false;
  }

  // --- CHAT MESSAGING ---
  Future<bool> sendChatMessage({
    required String senderId,
    required String senderName,
    required String senderRole,
    required String recipientId,
    required String recipientName,
    required String text,
    required bool isAdminOnly,
  }) async {
    try {
      final res = await ApiService.post('/api/chat', {
        'senderId': senderId,
        'senderName': senderName,
        'senderRole': senderRole,
        'recipientId': recipientId,
        'recipientName': recipientName,
        'text': text,
        'isAdminOnly': isAdminOnly,
      });
      if (res.statusCode == 200) {
        await fetchAllData();
        return true;
      }
    } catch (_) {}
    return false;
  }

  // --- DIRECTORY USER MANAGEMENT ---
  Future<bool> registerStaff({
    required String name,
    required String email,
    required String phone,
    required String role,
    required String password,
    String? adminKey,
  }) async {
    try {
      final res = await ApiService.post('/api/users', {
        'name': name,
        'email': email,
        'phone': phone,
        'role': role,
        'password': password,
        'admin_key': adminKey,
      });
      if (res.statusCode == 200) {
        await fetchAllData();
        return true;
      }
    } catch (_) {}
    return false;
  }

  Future<bool> deleteUser(String userId, {String? adminKey}) async {
    final query = adminKey != null ? '?admin_key=$adminKey' : '';
    try {
      final res = await ApiService.delete('/api/users/$userId$query');
      if (res.statusCode == 200) {
        await fetchAllData();
        return true;
      }
    } catch (_) {}
    return false;
  }

  Future<bool> forceResetPassword(String userId, String newPassword) async {
    try {
      final res = await ApiService.put('/api/users/$userId', {
        'password': newPassword,
      });
      if (res.statusCode == 200) {
        await fetchAllData();
        return true;
      }
    } catch (_) {}
    return false;
  }

  // --- PUBLIC CONTACT FORM ---
  Future<bool> submitContactForm({
    required String name,
    required String email,
    required String phone,
    required String message,
  }) async {
    try {
      final res = await ApiService.post('/api/contact', {
        'name': name,
        'email': email,
        'phone': phone,
        'message': message,
      });
      return res.statusCode == 200;
    } catch (_) {}
    return false;
  }
}
