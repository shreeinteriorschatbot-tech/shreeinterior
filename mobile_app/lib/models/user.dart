class User {
  final String id;
  final String email;
  final String name;
  final String role; // 'Admin', 'Manager', 'Staff'
  final String phone;

  User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    required this.phone,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      role: json['role'] ?? 'Staff',
      phone: json['phone'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'phone': phone,
    };
  }
}
