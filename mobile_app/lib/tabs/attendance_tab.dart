import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';
import '../models/site.dart';

class AttendanceTab extends StatefulWidget {
  const AttendanceTab({Key? key}) : super(key: key);

  @override
  State<AttendanceTab> createState() => _AttendanceTabState();
}

class _AttendanceTabState extends State<AttendanceTab> {
  String? _selectedSiteId;
  bool _isSimulated = false;
  bool _isLocating = false;
  bool _isPunching = false;

  // Haversine formula to compute distance in meters between two lat/long points
  int _getDistanceInMeters(double lat1, double lon1, double lat2, double lon2) {
    const R = 6371000; // Earth's radius in meters
    final phi1 = lat1 * pi / 180;
    final phi2 = lat2 * pi / 180;
    final deltaPhi = (lat2 - lat1) * pi / 180;
    final deltaLambda = (lon2 - lon1) * pi / 180;

    final a = sin(deltaPhi / 2) * sin(deltaPhi / 2) +
        cos(phi1) * cos(phi2) * sin(deltaLambda / 2) * sin(deltaLambda / 2);
    final c = 2 * atan2(sqrt(a), sqrt(1 - a));

    return (R * c).toInt();
  }

  // Fetch current position or use simulation coordinates
  Future<Position?> _getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Location services are disabled. Please enable them.')),
      );
      return null;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Location permissions are denied.')),
        );
        return null;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Location permissions are permanently denied.')),
      );
      return null;
    }

    return await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
  }

  Future<void> _punch(String type) async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final data = Provider.of<DataProvider>(context, listen: false);
    final user = auth.currentUser!;

    if (_selectedSiteId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a project site.')));
      return;
    }

    final site = data.sites.firstWhere((s) => s.id == _selectedSiteId);
    double punchLat;
    double punchLng;
    int distance = 0;

    if (_isSimulated) {
      // Direct simulation matches the site coordinates perfectly (0m)
      punchLat = site.latitude;
      punchLng = site.longitude;
    } else {
      setState(() => _isLocating = true);
      final pos = await _getCurrentLocation();
      setState(() => _isLocating = false);

      if (pos == null) return;
      punchLat = pos.latitude;
      punchLng = pos.longitude;

      distance = _getDistanceInMeters(punchLat, punchLng, site.latitude, site.longitude);
      
      // Radius limit check (200m)
      if (distance > 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Punch failed. You are $distance meters away from this site. Must be within 200m.'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }
    }

    setState(() => _isPunching = true);

    final success = await data.punchAttendance(
      userId: user.id,
      userName: user.name,
      role: user.role,
      siteId: site.id,
      siteName: site.name,
      type: type,
      latitude: punchLat,
      longitude: punchLng,
      isSimulated: _isSimulated,
      distance: distance,
    );

    setState(() => _isPunching = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Successfully punched $type at ${site.name}!'), backgroundColor: Colors.green),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to record punch-in. Try again.'), backgroundColor: Colors.red),
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

    // Active assigned sites
    final activeSites = user.role == 'Admin'
        ? data.sites.where((s) => s.status == 'Active').toList()
        : data.sites.where((s) => s.status == 'Active' && (s.managerId == user.id || s.staffIds.contains(user.id))).toList();

    // Default select first site
    if (_selectedSiteId == null && activeSites.isNotEmpty) {
      _selectedSiteId = activeSites[0].id;
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Staff Punch In/Out Card
          if (user.role != 'Admin') ...[
            Container(
              decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(16)),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'DAILY ATTENDANCE CHECK-IN',
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
                      labelText: 'Select Target Project Site',
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

                  // Location simulation toggle
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    activeColor: goldAccent,
                    title: const Text('Simulate Location (Skip GPS checks)', style: TextStyle(color: warmWhite, fontSize: 13)),
                    subtitle: const Text('Punch directly at site coordinates', style: TextStyle(color: Colors.white30, fontSize: 10)),
                    value: _isSimulated,
                    onChanged: (val) => setState(() => _isSimulated = val),
                  ),
                  const SizedBox(height: 25),

                  // Punch In / Out Actions Row
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: (_isLocating || _isPunching) ? null : () => _punch('In'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: _isLocating
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              : const Text('Punch In', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(width: 15),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: (_isLocating || _isPunching) ? null : () => _punch('Out'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.redAccent,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: const Text('Punch Out', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 25),
          ],

          // 2. Logs Directory List (visible to Admin/Managers always, Staff sees their own punches)
          const Text(
            'ATTENDANCE punch logs directory',
            style: TextStyle(color: goldAccent, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1),
          ),
          const SizedBox(height: 10),
          
          // Filter logs
          _buildLogsList(data, user),
        ],
      ),
    );
  }

  Widget _buildLogsList(DataProvider data, var user) {
    const warmWhite = Color(0xFFF9F6F0);
    const cardBg = Color(0xFF282828);
    const goldAccent = Color(0xFFF3C65F);

    final filteredLogs = user.role == 'Staff'
        ? data.attendanceLogs.where((l) => l.userId == user.id).toList()
        : data.attendanceLogs;

    if (filteredLogs.isEmpty) {
      return Container(
        decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(12)),
        padding: const EdgeInsets.all(20),
        child: const Center(child: Text('No attendance punches recorded.', style: TextStyle(color: Colors.white38, fontStyle: FontStyle.italic))),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: filteredLogs.length,
      itemBuilder: (context, index) {
        final log = filteredLogs[index];
        final dt = DateTime.parse(log.timestamp);
        final formattedTime = DateFormat('jm').format(dt.toLocal());
        final formattedDate = DateFormat('MMM dd, yyyy').format(dt.toLocal());

        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              // Badge punch-type type In/Out
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: log.type == 'In' ? Colors.green.withOpacity(0.15) : Colors.redAccent.withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Icon(
                    log.type == 'In' ? Icons.login : Icons.logout,
                    color: log.type == 'In' ? Colors.green : Colors.redAccent,
                    size: 18,
                  ),
                ),
              ),
              const SizedBox(width: 15),

              // Punch details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      log.userName,
                      style: const TextStyle(color: warmWhite, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${log.siteName} (${log.role})',
                      style: const TextStyle(color: Colors.white30, fontSize: 10),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      log.isSimulated
                          ? 'Location Simulated (0m)'
                          : 'GPS distance: ${log.distance} meters away',
                      style: TextStyle(color: log.isSimulated ? goldAccent : Colors.white54, fontSize: 9),
                    ),
                  ],
                ),
              ),

              // Timestamp details
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(formattedTime, style: const TextStyle(color: warmWhite, fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 2),
                  Text(formattedDate, style: const TextStyle(color: Colors.white30, fontSize: 9)),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
