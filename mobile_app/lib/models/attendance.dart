class Attendance {
  final String id;
  final String userId;
  final String userName;
  final String role;
  final String siteId;
  final String siteName;
  final String type; // 'In', 'Out'
  final String timestamp;
  final double latitude;
  final double longitude;
  final bool isSimulated;
  final int distance;

  Attendance({
    required this.id,
    required this.userId,
    required this.userName,
    required this.role,
    required this.siteId,
    required this.siteName,
    required this.type,
    required this.timestamp,
    required this.latitude,
    required this.longitude,
    required this.isSimulated,
    required this.distance,
  });

  factory Attendance.fromJson(Map<String, dynamic> json) {
    return Attendance(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      userName: json['userName'] ?? '',
      role: json['role'] ?? '',
      siteId: json['siteId'] ?? '',
      siteName: json['siteName'] ?? '',
      type: json['type'] ?? 'In',
      timestamp: json['timestamp'] ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      isSimulated: json['isSimulated'] ?? false,
      distance: (json['distance'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'userName': userName,
      'role': role,
      'siteId': siteId,
      'siteName': siteName,
      'type': type,
      'timestamp': timestamp,
      'latitude': latitude,
      'longitude': longitude,
      'isSimulated': isSimulated,
      'distance': distance,
    };
  }
}
