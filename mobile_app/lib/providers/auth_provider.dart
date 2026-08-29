import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../services/local_storage.dart';

class AuthProvider with ChangeNotifier {
  User? _currentUser;
  bool _isAuthenticated = false;
  bool _isLoading = false;

  User? get currentUser => _currentUser;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;

  // Check login status on app launch
  Future<void> checkLoginStatus() async {
    _isLoading = true;
    notifyListeners();

    final token = await LocalStorage.getToken();
    final user = await LocalStorage.getUser();

    if (token != null && user != null) {
      _currentUser = user;
      _isAuthenticated = true;
      
      // Silently refresh profile
      try {
        final res = await ApiService.get('/api/auth/me');
        if (res.statusCode == 200) {
          final updatedUser = User.fromJson(jsonDecode(res.body));
          _currentUser = updatedUser;
          await LocalStorage.saveUser(updatedUser);
        } else if (res.statusCode == 401) {
          // Token expired
          await logout();
        }
      } catch (_) {}
    }

    _isLoading = false;
    notifyListeners();
  }

  // Login handler
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final res = await ApiService.post('/api/auth/login', {
        'email': email,
        'password': password,
      });

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final token = data['access_token'] as String;
        final user = User.fromJson(data['user']);

        await LocalStorage.saveToken(token);
        await LocalStorage.saveUser(user);

        _currentUser = user;
        _isAuthenticated = true;
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (_) {}

    _isLoading = false;
    notifyListeners();
    return false;
  }

  // Logout handler
  Future<void> logout() async {
    await LocalStorage.clearAll();
    _currentUser = null;
    _isAuthenticated = false;
    notifyListeners();
  }

  // Update own password
  Future<bool> resetPassword(String oldPassword, String newPassword) async {
    try {
      final res = await ApiService.put('/api/auth/reset-password', {
        'old_password': oldPassword,
        'new_password': newPassword,
      });
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
