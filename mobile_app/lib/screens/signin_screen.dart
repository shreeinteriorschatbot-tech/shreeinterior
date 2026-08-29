import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({Key? key}) : super(key: key);

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  Future<void> _handleSignIn() async {
    if (!_formKey.currentState!.validate()) return;

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final success = await auth.login(
      _emailController.text.trim(),
      _passwordController.text.trim(),
    );

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Welcome back, ${auth.currentUser?.name}!'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pushReplacementNamed(context, '/dashboard');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Invalid email or password'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    const charcoal = Color(0xFF1E1E1E);
    const goldAccent = Color(0xFFF3C65F);
    const warmWhite = Color(0xFFF9F6F0);
    const cardBg = Color(0xFF282828);

    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: charcoal,
      body: SafeArea(
        child: Stack(
          children: [
            // Back button
            Positioned(
              top: 10,
              left: 10,
              child: IconButton(
                icon: const Icon(Icons.arrow_back, color: warmWhite),
                onPressed: () => Navigator.pop(context),
              ),
            ),

            Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Circular Logo
                      Container(
                        width: 90,
                        height: 90,
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black26,
                              blurRadius: 10,
                              offset: Offset(0, 4),
                            ),
                          ],
                          image: DecorationImage(
                            image: AssetImage('assets/circle-logo.png'),
                            fit: BoxFit.contain,
                          ),
                        ),
                      ),
                      const SizedBox(height: 15),
                      const Text(
                        'Shree Interiors',
                        style: TextStyle(color: warmWhite, fontSize: 26, fontWeight: FontWeight.bold),
                      ),
                      const Text(
                        'Management Portal',
                        style: TextStyle(color: goldAccent, fontSize: 13, fontWeight: FontWeight.w500, letterSpacing: 1),
                      ),
                      const SizedBox(height: 35),

                      // Sign In Card
                      Container(
                        decoration: BoxDecoration(
                          color: cardBg,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withOpacity(0.05)),
                        ),
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Text(
                              'Sign In',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: warmWhite, fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 5),
                            Text(
                              'Access your personalized workspace dashboard',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: warmWhite.withOpacity(0.5), fontSize: 11),
                            ),
                            const SizedBox(height: 25),

                            // Email input
                            TextFormField(
                              controller: _emailController,
                              style: const TextStyle(color: warmWhite, fontSize: 14),
                              decoration: InputDecoration(
                                labelText: 'Email Address',
                                labelStyle: TextStyle(color: warmWhite.withOpacity(0.5)),
                                prefixIcon: const Icon(Icons.email, color: goldAccent, size: 20),
                                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: warmWhite.withOpacity(0.1))),
                                focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: goldAccent)),
                              ),
                              validator: (value) {
                                if (value == null || value.trim().isEmpty) return 'Required';
                                return null;
                              },
                            ),
                            const SizedBox(height: 20),

                            // Password input
                            TextFormField(
                              controller: _passwordController,
                              obscureText: true,
                              style: const TextStyle(color: warmWhite, fontSize: 14),
                              decoration: InputDecoration(
                                labelText: 'Password',
                                labelStyle: TextStyle(color: warmWhite.withOpacity(0.5)),
                                prefixIcon: const Icon(Icons.lock, color: goldAccent, size: 20),
                                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: warmWhite.withOpacity(0.1))),
                                focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: goldAccent)),
                              ),
                              validator: (value) {
                                if (value == null || value.trim().isEmpty) return 'Required';
                                return null;
                              },
                            ),
                            const SizedBox(height: 35),

                            // Submit Button
                            ElevatedButton(
                              onPressed: auth.isLoading ? null : _handleSignIn,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: goldAccent,
                                foregroundColor: charcoal,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              child: Center(
                                child: auth.isLoading
                                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: charcoal, strokeWidth: 2))
                                    : const Text('Sign In', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
