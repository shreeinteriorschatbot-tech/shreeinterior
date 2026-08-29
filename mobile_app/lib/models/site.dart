class ChecklistItem {
  final String id;
  final String text;
  bool completed;
  int percentage;
  final String description;

  ChecklistItem({
    required this.id,
    required this.text,
    required this.completed,
    required this.percentage,
    required this.description,
  });

  factory ChecklistItem.fromJson(Map<String, dynamic> json) {
    return ChecklistItem(
      id: json['id'] ?? '',
      text: json['text'] ?? '',
      completed: json['completed'] ?? false,
      percentage: (json['percentage'] as num?)?.toInt() ?? 0,
      description: json['description'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'text': text,
      'completed': completed,
      'percentage': percentage,
      'description': description,
    };
  }
}

class Site {
  final String id;
  final String name;
  final String address;
  final double latitude;
  final double longitude;
  final String gmapLink;
  final String startDate;
  String status; // 'Active', 'Completed'
  final String managerId;
  final List<String> staffIds;
  final List<ChecklistItem> checklist;

  Site({
    required this.id,
    required this.name,
    required this.address,
    required this.latitude,
    required this.longitude,
    required this.gmapLink,
    required this.startDate,
    required this.status,
    required this.managerId,
    required this.staffIds,
    required this.checklist,
  });

  factory Site.fromJson(Map<String, dynamic> json) {
    var staffList = json['staffIds'] as List? ?? [];
    var checklistList = json['checklist'] as List? ?? [];

    return Site(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      address: json['address'] ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      gmapLink: json['gmapLink'] ?? '',
      startDate: json['startDate'] ?? '',
      status: json['status'] ?? 'Active',
      managerId: json['managerId'] ?? '',
      staffIds: staffList.map((e) => e.toString()).toList(),
      checklist: checklistList.map((e) => ChecklistItem.fromJson(e)).toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'address': address,
      'latitude': latitude,
      'longitude': longitude,
      'gmapLink': gmapLink,
      'startDate': startDate,
      'status': status,
      'managerId': managerId,
      'staffIds': staffIds,
      'checklist': checklist.map((e) => e.toJson()).toList(),
    };
  }
}
