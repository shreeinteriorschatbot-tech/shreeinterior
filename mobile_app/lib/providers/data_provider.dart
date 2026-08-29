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
        _users = (jsonDecode(futures[0].body) as List)
            .map((e) => User.fromJson(e))
            .toList();
      }
      if (futures[1].statusCode == 200) {
        _sites = (jsonDecode(futures[1].body) as List)
            .map((e) => Site.fromJson(e))
            .toList();
      }
      if (futures[2].statusCode == 200) {
        _attendanceLogs = (jsonDecode(futures[2].body) as List)
            .map((e) => Attendance.fromJson(e))
            .toList();
      }
      if (futures[3].statusCode == 200) {
        _bills = (jsonDecode(futures[3].body) as List)
            .map((e) => Bill.fromJson(e))
            .toList();
      }
      if (futures[4].statusCode == 200) {
        _payments = (jsonDecode(futures[4].body) as List)
            .map((e) => Payment.fromJson(e))
            .toList();
      }
      if (futures[5].statusCode == 200) {
        _workDoneList = (jsonDecode(futures[5].body) as List)
            .map((e) => WorkDone.fromJson(e))
            .toList();
      }
      if (futures[6].statusCode == 200) {
        _chatMessages = (jsonDecode(futures[6].body) as List)
            .map((e) => ChatMessage.fromJson(e))
            .toList();
      }
      if (futures[7].statusCode == 200) {
        _enquiries = (jsonDecode(futures[7].body) as List)
            .map((e) => Enquiry.fromJson(e))
            .toList();
      }
    } catch (_) {}

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
      final res = await ApiService.put('/api/workdone/$recordId', {
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
      final res = await ApiService.put('/api/bills/$billId', {
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
