import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

// Providers
import 'providers/auth_provider.dart';
import 'providers/data_provider.dart';

// Screens
import 'screens/landing_screen.dart';
import 'screens/signin_screen.dart';
import 'screens/dashboard_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..checkLoginStatus()),
        ChangeNotifierProvider(create: (_) => DataProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    const charcoal = Color(0xFF1E1E1E);
    const goldAccent = Color(0xFFF3C65F);
    const warmWhite = Color(0xFFF9F6F0);

    return MaterialApp(
      title: 'Shree Interiors Portal',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: charcoal,
        colorScheme: const ColorScheme.dark(
          primary: goldAccent,
          secondary: goldAccent,
          surface: Color(0xFF282828),
          background: charcoal,
        ),
        textTheme: const TextTheme(
          bodyLarge: TextStyle(color: warmWhite),
          bodyMedium: TextStyle(color: warmWhite),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFF282828),
          labelStyle: TextStyle(color: warmWhite.withOpacity(0.6)),
          hintStyle: TextStyle(color: warmWhite.withOpacity(0.3)),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: goldAccent),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Colors.redAccent),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Colors.redAccent, width: 2),
          ),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: charcoal,
          iconTheme: IconThemeData(color: warmWhite),
          titleTextStyle: TextStyle(color: warmWhite, fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const LandingScreen(),
        '/signin': (context) => const SignInScreen(),
        '/dashboard': (context) => const DashboardScreen(),
      },
    );
  }
}
