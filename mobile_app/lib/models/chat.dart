class ChatMessage {
  final String id;
  final String senderId;
  final String senderName;
  final String senderRole;
  final String recipientId;
  final String recipientName;
  final String text;
  final String timestamp;
  final bool isAdminOnly;

  ChatMessage({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.senderRole,
    required this.recipientId,
    required this.recipientName,
    required this.text,
    required this.timestamp,
    required this.isAdminOnly,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] ?? '',
      senderId: json['senderId'] ?? '',
      senderName: json['senderName'] ?? '',
      senderRole: json['senderRole'] ?? '',
      recipientId: json['recipientId'] ?? '',
      recipientName: json['recipientName'] ?? '',
      text: json['text'] ?? '',
      timestamp: json['timestamp'] ?? '',
      isAdminOnly: json['isAdminOnly'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'senderId': senderId,
      'senderName': senderName,
      'senderRole': senderRole,
      'recipientId': recipientId,
      'recipientName': recipientName,
      'text': text,
      'timestamp': timestamp,
      'isAdminOnly': isAdminOnly,
    };
  }
}
