import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/data_provider.dart';

class LandingScreen extends StatefulWidget {
  const LandingScreen({Key? key}) : super(key: key);

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen> {
  final _scrollController = ScrollController();
  final _contactKey = GlobalKey();
  final _galleryKey = GlobalKey();

  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _messageController = TextEditingController();
  bool _isSubmitting = false;

  void _scrollTo(GlobalKey key) {
    final context = key.currentContext;
    if (context != null) {
      Scrollable.ensureVisible(
        context,
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeInOut,
      );
    }
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);

    final success = await Provider.of<DataProvider>(context, listen: false).submitContactForm(
      name: _nameController.text.trim(),
      email: _emailController.text.trim(),
      phone: _phoneController.text.trim(),
      message: _messageController.text.trim(),
    );

    setState(() => _isSubmitting = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Thank you! We will get in touch shortly.'),
          backgroundColor: Colors.green,
        ),
      );
      _nameController.clear();
      _emailController.clear();
      _phoneController.clear();
      _messageController.clear();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to submit. Please check your connection.'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // Shree Interiors Design Color Palette
    const charcoal = Color(0xFF1E1E1E);
    const goldAccent = Color(0xFFF3C65F);
    const warmWhite = Color(0xFFF9F6F0);
    const cardBg = Color(0xFF282828);

    return Scaffold(
      backgroundColor: charcoal,
      appBar: AppBar(
        backgroundColor: charcoal,
        elevation: 0,
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                color: goldAccent,
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Text(
                  'S',
                  style: TextStyle(color: charcoal, fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
            ),
            const SizedBox(width: 10),
            const Text(
              'Shree Interiors',
              style: TextStyle(color: warmWhite, fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pushNamed(context, '/signin'),
            child: const Text(
              'Sign In',
              style: TextStyle(color: goldAccent, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        controller: _scrollController,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Hero Section
            Container(
              height: MediaQuery.of(context).size.height * 0.7,
              decoration: const BoxDecoration(
                image: DecorationImage(
                  image: AssetImage('assets/hero-interior.jpg'), // maps to hero-interior.jpg
                  fit: BoxFit.cover,
                  colorFilter: ColorFilter.mode(Colors.black54, BlendMode.darken),
                ),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 30),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.star, color: goldAccent, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'PREMIUM INTERIOR DESIGN',
                        style: TextStyle(color: goldAccent, fontWeight: FontWeight.bold, letterSpacing: 1.5, fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 15),
                  const Text(
                    'Transforming\nSpaces into\nModern Interiors',
                    style: TextStyle(color: warmWhite, fontSize: 40, fontWeight: FontWeight.bold, height: 1.2),
                  ),
                  const SizedBox(height: 15),
                  Text(
                    'From modular kitchens to complete home makeovers, we bring your vision to life.',
                    style: TextStyle(color: warmWhite.withOpacity(0.9), fontSize: 16, height: 1.4),
                  ),
                  const SizedBox(height: 30),
                  Row(
                    children: [
                      ElevatedButton(
                        onPressed: () => _scrollTo(_contactKey),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: goldAccent,
                          foregroundColor: charcoal,
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('Free Consultation', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 12),
                      OutlinedButton(
                        onPressed: () => _scrollTo(_galleryKey),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: warmWhite,
                          side: const BorderSide(color: warmWhite, width: 2),
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('View Work'),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // 2. Services Section
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'OUR SERVICES',
                    style: TextStyle(color: goldAccent, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'What We Specialize In',
                    style: TextStyle(color: warmWhite, fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 20),
                  _buildServiceCard('Modular Kitchen', 'Premium custom designs optimized for modular cooking spaces.', Icons.kitchen, cardBg, warmWhite, goldAccent),
                  const SizedBox(height: 12),
                  _buildServiceCard('Wardrobe & Storage', 'Smart wardrobe spaces engineered for modern utility.', Icons.bed, cardBg, warmWhite, goldAccent),
                  const SizedBox(height: 12),
                  _buildServiceCard('False Ceiling', 'Decorative and architectural lighting false ceilings.', Icons.light, cardBg, warmWhite, goldAccent),
                ],
              ),
            ),

            // 3. About Section
            Container(
              color: cardBg,
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'ABOUT US',
                    style: TextStyle(color: goldAccent, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Our Craftsmanship Story',
                    style: TextStyle(color: warmWhite, fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 15),
                  Text(
                    'With over 15 years of industry excellence, Shree Interiors is dedicated to delivering state-of-the-art designs and quality carpentry.',
                    style: TextStyle(color: warmWhite.withOpacity(0.8), height: 1.5),
                  ),
                  const SizedBox(height: 25),
                  Row(
                    children: [
                      Expanded(child: _buildFounderCard('Anand R', 'Co-Founder', 'assets/anand.png', warmWhite, goldAccent)),
                      const SizedBox(width: 15),
                      Expanded(child: _buildFounderCard('Arunkumar P', 'Co-Founder', 'assets/arunkumar.png', warmWhite, goldAccent)),
                    ],
                  ),
                ],
              ),
            ),

            // 4. Gallery Section
            Padding(
              key: _galleryKey,
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'GALLERY',
                    style: TextStyle(color: goldAccent, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Showcase of Work Done',
                    style: TextStyle(color: warmWhite, fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 20),
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 2,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    children: [
                      _buildGalleryImage('assets/modular-kitchen.jpg'),
                      _buildGalleryImage('assets/false-ceiling.jpg'),
                      _buildGalleryImage('assets/wardrobe-storage.jpg'),
                      _buildGalleryImage('assets/hero-interior.jpg'),
                    ],
                  ),
                ],
              ),
            ),

            // 5. Contact Section
            Container(
              key: _contactKey,
              color: cardBg,
              padding: const EdgeInsets.all(20),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'GET IN TOUCH',
                      style: TextStyle(color: goldAccent, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Request Free Consultation',
                      style: TextStyle(color: warmWhite, fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 20),
                    _buildTextField(_nameController, 'Full Name', Icons.person, warmWhite, goldAccent),
                    const SizedBox(height: 12),
                    _buildTextField(_emailController, 'Email Address', Icons.email, warmWhite, goldAccent, isEmail: true),
                    const SizedBox(height: 12),
                    _buildTextField(_phoneController, 'Phone Number', Icons.phone, warmWhite, goldAccent, isPhone: true),
                    const SizedBox(height: 12),
                    _buildTextField(_messageController, 'How can we help you?', Icons.message, warmWhite, goldAccent, maxLines: 3),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitForm,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: goldAccent,
                        foregroundColor: charcoal,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: Center(
                        child: _isSubmitting
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: charcoal, strokeWidth: 2))
                            : const Text('Submit Request', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Footer
            Container(
              color: charcoal,
              padding: const EdgeInsets.all(30),
              child: Column(
                children: [
                  const Text('Shree Interiors', style: TextStyle(color: warmWhite, fontWeight: FontWeight.bold, fontSize: 18)),
                  const SizedBox(height: 10),
                  Text('© 2026 Shree Interiors. All rights reserved.', style: TextStyle(color: warmWhite.withOpacity(0.5), fontSize: 12)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServiceCard(String title, String desc, IconData icon, Color bg, Color text, Color accent) {
    return Container(
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: accent, size: 28),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(color: text, fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 6),
                Text(desc, style: TextStyle(color: text.withOpacity(0.7), fontSize: 13, height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFounderCard(String name, String role, String assetPath, Color text, Color accent) {
    return Column(
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            image: DecorationImage(image: AssetImage(assetPath), fit: BoxFit.cover),
          ),
        ),
        const SizedBox(height: 10),
        Text(name, style: TextStyle(color: text, fontWeight: FontWeight.bold, fontSize: 14)),
        Text(role, style: TextStyle(color: accent, fontSize: 11)),
      ],
    );
  }

  Widget _buildGalleryImage(String assetPath) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: Image.asset(assetPath, fit: BoxFit.cover),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, IconData icon, Color text, Color accent, {bool isEmail = false, bool isPhone = false, int maxLines = 1}) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      style: TextStyle(color: text),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: text.withOpacity(0.6)),
        prefixIcon: Icon(icon, color: accent, size: 20),
        enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: text.withOpacity(0.2))),
        focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: accent)),
        filled: true,
        fillColor: Colors.white.withOpacity(0.02),
      ),
      validator: (value) {
        if (value == null || value.trim().isEmpty) return 'Required';
        if (isEmail && !RegExp(r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+").hasMatch(value)) {
          return 'Invalid email';
        }
        return null;
      },
    );
  }
}
