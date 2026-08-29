class WorkDone {
  final String id;
  final String userId;
  final String userName;
  final String role;
  final String siteId;
  final String siteName;
  final String photoUrl;
  final String description;
  final String timestamp;
  String? reviewText;

  WorkDone({
    required this.id,
    required this.userId,
    required this.userName,
    required this.role,
    required this.siteId,
    required this.siteName,
    required this.photoUrl,
    required this.description,
    required this.timestamp,
    this.reviewText,
  });

  factory WorkDone.fromJson(Map<String, dynamic> json) {
    return WorkDone(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      userName: json['userName'] ?? '',
      role: json['role'] ?? '',
      siteId: json['siteId'] ?? '',
      siteName: json['siteName'] ?? '',
      photoUrl: json['photoUrl'] ?? '',
      description: json['description'] ?? '',
      timestamp: json['timestamp'] ?? '',
      reviewText: json['reviewText'],
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
      'photoUrl': photoUrl,
      'description': description,
      'timestamp': timestamp,
      'reviewText': reviewText,
    };
  }
}
