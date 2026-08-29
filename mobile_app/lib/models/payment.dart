class Payment {
  final String id;
  final String type; // 'Salary', 'Bill'
  final String userId;
  final String userName;
  final String role;
  final String? billId;
  final double amount;
  String status; // 'Paid', 'Pending'
  final String description;
  final String dateUpdated;

  Payment({
    required this.id,
    required this.type,
    required this.userId,
    required this.userName,
    required this.role,
    this.billId,
    required this.amount,
    required this.status,
    required this.description,
    required this.dateUpdated,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'] ?? '',
      type: json['type'] ?? 'Salary',
      userId: json['userId'] ?? '',
      userName: json['userName'] ?? '',
      role: json['role'] ?? '',
      billId: json['billId'],
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] ?? 'Pending',
      description: json['description'] ?? '',
      dateUpdated: json['dateUpdated'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'userId': userId,
      'userName': userName,
      'role': role,
      'billId': billId,
      'amount': amount,
      'status': status,
      'description': description,
      'dateUpdated': dateUpdated,
    };
  }
}
