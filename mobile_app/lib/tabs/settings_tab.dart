import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';
import '../models/user.dart';

class SettingsTab extends StatefulWidget {
  const SettingsTab({Key? key}) : super(key: key);

  @override
  State<SettingsTab> createState() => _SettingsTabState();
}

class _SettingsTabState extends State<SettingsTab> {
  final _pwFormKey = GlobalKey<FormState>();
  final _oldPwController = TextEditingController();
  final _newPwController = TextEditingController();
  bool _isResetting = false;

  final _regFormKey = GlobalKey<FormState>();
  final _regNameController = TextEditingController();
  final _regEmailController = TextEditingController();
  final _regPhoneController = TextEditingController();
  final _regPwController = TextEditingController();
  final _adminKeyController = TextEditingController();

  String _regRole = 'Staff';
  bool _isRegistering = false;

  Future<void> _handlePasswordReset() async {
    if (!_pwFormKey.currentState!.validate()) return;
    setState(() => _isResetting = true);

    final success = await Provider.of<AuthProvider>(context, listen: false).resetPassword(
      _oldPwController.text,
      _newPwController.text,
    );

    setState(() => _isResetting = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password updated successfully!'), backgroundColor: Colors.green),
      );
      _oldPwController.clear();
      _newPwController.clear();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to update password. Verify old password.'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _handleUserRegistration() async {
    if (!_regFormKey.currentState!.validate()) return;

    if (_regRole == 'Admin' && _adminKeyController.text.trim() != 'IAMYOURMASTER') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid master admin registration key'), backgroundColor: Colors.red),
      );
      return;
    }

    setState(() => _isRegistering = true);

    final success = await Provider.of<DataProvider>(context, listen: false).registerStaff(
      name: _regNameController.text.trim(),
      email: _regEmailController.text.trim(),
      phone: _regPhoneController.text.trim(),
      role: _regRole,
      password: _regPwController.text,
      adminKey: _regRole == 'Admin' ? _adminKeyController.text.trim() : null,
    );

    setState(() => _isRegistering = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('User registered successfully!'), backgroundColor: Colors.green),
      );
      _regNameController.clear();
      _regEmailController.clear();
      _regPhoneController.clear();
      _regPwController.clear();
      _adminKeyController.clear();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Registration failed. Email might already exist.'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _handleDeleteUser(User targetUser) async {
    final data = Provider.of<DataProvider>(context, listen: false);

    if (targetUser.role == 'Admin') {
      // Prompt for secret authorization key
      String? keyInput = await _promptAdminKeyDialog();
      if (keyInput == null) return;
      if (keyInput != 'IAMYOURMASTER') {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Unauthorized master delete key'), backgroundColor: Colors.red));
        return;
      }

      final success = await data.deleteUser(targetUser.id, adminKey: keyInput);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Founder admin deleted!'), backgroundColor: Colors.green));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to delete.'), backgroundColor: Colors.red));
      }
    } else {
      // Standard confirm deletion
      final confirm = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Delete Account'),
          content: Text('Are you sure you want to delete the profile of ${targetUser.name}?'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
            TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete', style: TextStyle(color: Colors.red))),
          ],
        ),
      );

      if (confirm == true) {
        final success = await data.deleteUser(targetUser.id);
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('User removed successfully.'), backgroundColor: Colors.green));
        } else {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to delete user.'), backgroundColor: Colors.red));
        }
      }
    }
  }

  Future<String?> _promptAdminKeyDialog() async {
    final controller = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Authorize Master Admin Delete'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('To delete a Master Admin profile, you must validate the authorization secret key:'),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Secret Key'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, null), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(context, controller.text), child: const Text('Confirm', style: TextStyle(color: Colors.red))),
        ],
      ),
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

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Password Reset Card
          Container(
            decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(16)),
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _pwFormKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('RESET PASSWORD', style: TextStyle(color: goldAccent, fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1)),
                  const SizedBox(height: 15),
                  TextFormField(
                    controller: _oldPwController,
                    obscureText: true,
                    style: const TextStyle(color: warmWhite, fontSize: 14),
                    decoration: const InputDecoration(labelText: 'Current Password', labelStyle: TextStyle(color: Colors.white54)),
                    validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _newPwController,
                    obscureText: true,
                    style: const TextStyle(color: warmWhite, fontSize: 14),
                    decoration: const InputDecoration(labelText: 'New Password', labelStyle: TextStyle(color: Colors.white54)),
                    validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _isResetting ? null : _handlePasswordReset,
                    style: ElevatedButton.styleFrom(backgroundColor: goldAccent, foregroundColor: Colors.black),
                    child: _isResetting
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Text('Update Password'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 25),

          // 2. Admin Register User Form (Admin only)
          if (user.role == 'Admin') ...[
            Container(
              decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(16)),
              padding: const EdgeInsets.all(20),
              child: Form(
                key: _regFormKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('REGISTER STAFF ACCOUNT', style: TextStyle(color: goldAccent, fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1)),
                    const SizedBox(height: 15),
                    TextFormField(
                      controller: _regNameController,
                      style: const TextStyle(color: warmWhite, fontSize: 14),
                      decoration: const InputDecoration(labelText: 'Full Name', labelStyle: TextStyle(color: Colors.white54)),
                      validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _regEmailController,
                      style: const TextStyle(color: warmWhite, fontSize: 14),
                      decoration: const InputDecoration(labelText: 'Email Address', labelStyle: TextStyle(color: Colors.white54)),
                      validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _regPhoneController,
                      style: const TextStyle(color: warmWhite, fontSize: 14),
                      decoration: const InputDecoration(labelText: 'Phone Number', labelStyle: TextStyle(color: Colors.white54)),
                      validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      dropdownColor: cardBg,
                      value: _regRole,
                      style: const TextStyle(color: warmWhite),
                      decoration: const InputDecoration(labelText: 'Assigned Role', labelStyle: TextStyle(color: Colors.white60)),
                      items: const [
                        DropdownMenuItem(value: 'Staff', child: Text('Staff Field Engineer')),
                        DropdownMenuItem(value: 'Manager', child: Text('Project Manager')),
                        DropdownMenuItem(value: 'Admin', child: Text('Master Admin')),
                      ],
                      onChanged: (val) => setState(() => _regRole = val ?? 'Staff'),
                    ),
                    if (_regRole == 'Admin') ...[
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _adminKeyController,
                        obscureText: true,
                        style: const TextStyle(color: warmWhite, fontSize: 14),
                        decoration: const InputDecoration(labelText: 'Admin Authorization Secret Key', labelStyle: TextStyle(color: Colors.white54)),
                        validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                      ),
                    ],
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _regPwController,
                      obscureText: true,
                      style: const TextStyle(color: warmWhite, fontSize: 14),
                      decoration: const InputDecoration(labelText: 'Portal Password', labelStyle: TextStyle(color: Colors.white54)),
                      validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: _isRegistering ? null : _handleUserRegistration,
                      style: ElevatedButton.styleFrom(backgroundColor: goldAccent, foregroundColor: Colors.black),
                      child: _isRegistering
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Text('Register Personnel'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 25),

            // 3. User Directory (Admin only)
            const Text('PERSONNEL DIRECTORY LIST', style: TextStyle(color: goldAccent, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1)),
            const SizedBox(height: 10),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: data.users.length,
              itemBuilder: (context, index) {
                final target = data.users[index];
                final isSelf = target.id == user.id;

                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: goldAccent.withOpacity(0.15),
                        child: Text(target.name[0], style: const TextStyle(color: goldAccent, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 15),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(target.name + (isSelf ? ' (You)' : ''), style: const TextStyle(color: warmWhite, fontWeight: FontWeight.bold, fontSize: 13)),
                            Text('${target.email} | ${target.phone}', style: const TextStyle(color: Colors.white30, fontSize: 10)),
                            const SizedBox(height: 4),
                            Text(target.role, style: const TextStyle(color: goldAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                      if (!isSelf)
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.redAccent, size: 20),
                          onPressed: () => _handleDeleteUser(target),
                        ),
                    ],
                  ),
                );
              },
            ),
          ],
        ],
      ),
    );
  }
}
