class Bill {
  final String id;
  final String managerId;
  final String managerName;
  final String siteId;
  final String siteName;
  final double amount;
  final String description;
  String status; // 'Pending', 'Approved', 'Rejected'
  final String timestamp;
  final String photoUrl;

  Bill({
    required this.id,
    required this.managerId,
    required this.managerName,
    required this.siteId,
    required this.siteName,
    required this.amount,
    required this.description,
    required this.status,
    required this.timestamp,
    required this.photoUrl,
  });

  factory Bill.fromJson(Map<String, dynamic> json) {
    return Bill(
      id: json['id'] ?? '',
      managerId: json['managerId'] ?? '',
      managerName: json['managerName'] ?? '',
      siteId: json['siteId'] ?? '',
      siteName: json['siteName'] ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      description: json['description'] ?? '',
      status: json['status'] ?? 'Pending',
      timestamp: json['timestamp'] ?? '',
      photoUrl: json['photoUrl'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'managerId': managerId,
      'managerName': managerName,
      'siteId': siteId,
      'siteName': siteName,
      'amount': amount,
      'description': description,
      'status': status,
      'timestamp': timestamp,
      'photoUrl': photoUrl,
    };
  }
}
