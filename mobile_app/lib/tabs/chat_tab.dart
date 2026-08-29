import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';
import '../models/chat.dart';
import '../models/user.dart';

class ChatTab extends StatefulWidget {
  const ChatTab({Key? key}) : super(key: key);

  @override
  State<ChatTab> createState() => _ChatTabState();
}

class _ChatTabState extends State<ChatTab> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  
  String _selectedRecipientId = 'AdminGroup'; // 'AdminGroup' or specific userId
  bool _isAdminOnly = true;

  @override
  void initState() {
    super.initState();
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final data = Provider.of<DataProvider>(context, listen: false);
    final user = auth.currentUser!;

    String recId = _selectedRecipientId;
    String recName = 'Admin Group';

    if (recId != 'AdminGroup') {
      final recUser = data.users.firstWhere((u) => u.id == recId);
      recName = recUser.name;
    }

    final success = await data.sendChatMessage(
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      recipientId: recId,
      recipientName: recName,
      text: text,
      isAdminOnly: _isAdminOnly,
    );

    if (success) {
      _messageController.clear();
      _scrollToBottom();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to send message'), backgroundColor: Colors.red),
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

    // List of message recipients (other staff members)
    final recipients = data.users.where((u) => u.id != user.id).toList();

    // Filter messages visible to this user
    // - Admin: sees all messages
    // - Non-Admin: sees messages they sent OR messages sent to them OR AdminOnly messages if they are part of admin channels
    final visibleMessages = data.chatMessages.where((m) {
      if (user.role == 'Admin') return true;
      if (m.senderId == user.id || m.recipientId == user.id) return true;
      if (m.isAdminOnly && (user.role == 'Manager' || user.role == 'Admin')) return true;
      return false;
    }).toList();

    // Auto-scroll on new message arrivals
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

    return Column(
      children: [
        // 1. Selector bar
        Container(
          color: cardBg,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              const Icon(Icons.people, color: goldAccent, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    dropdownColor: cardBg,
                    value: _selectedRecipientId,
                    style: const TextStyle(color: warmWhite, fontSize: 13),
                    items: [
                      const DropdownMenuItem(value: 'AdminGroup', child: Text('Admin/Managers Broadcast Group')),
                      ...recipients.map((u) {
                        return DropdownMenuItem(value: u.id, child: Text('${u.name} (${u.role})'));
                      }).toList(),
                    ],
                    onChanged: (val) {
                      setState(() {
                        _selectedRecipientId = val ?? 'AdminGroup';
                        _isAdminOnly = _selectedRecipientId == 'AdminGroup';
                      });
                    },
                  ),
                ),
              ),
            ],
          ),
        ),

        // 2. Chat messages viewport
        Expanded(
          child: visibleMessages.isEmpty
              ? const Center(
                  child: Text(
                    'No messages. Start typing below...',
                    style: TextStyle(color: Colors.white24, fontStyle: FontStyle.italic, fontSize: 13),
                  ),
                )
              : ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: visibleMessages.length,
                  itemBuilder: (context, index) {
                    final msg = visibleMessages[index];
                    final isMe = msg.senderId == user.id;
                    final dt = DateTime.parse(msg.timestamp);
                    final formattedTime = DateFormat('jm').format(dt.toLocal());

                    return Align(
                      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                        decoration: BoxDecoration(
                          color: isMe ? goldAccent : cardBg,
                          borderRadius: BorderRadius.only(
                            topLeft: const Radius.circular(12),
                            topRight: const Radius.circular(12),
                            bottomLeft: isMe ? const Radius.circular(12) : Radius.zero,
                            bottomRight: isMe ? Radius.zero : const Radius.circular(12),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (!isMe) ...[
                              Text(
                                '${msg.senderName} (${msg.senderRole})',
                                style: TextStyle(
                                  color: isMe ? Colors.black54 : goldAccent,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 10,
                                ),
                              ),
                              const SizedBox(height: 4),
                            ],
                            Text(
                              msg.text,
                              style: TextStyle(
                                color: isMe ? Colors.black87 : warmWhite,
                                fontSize: 13,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Align(
                              alignment: Alignment.bottomRight,
                              child: Text(
                                formattedTime,
                                style: TextStyle(
                                  color: isMe ? Colors.black38 : Colors.white30,
                                  fontSize: 8,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),

        // 3. Text composition footer input
        Container(
          color: cardBg,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _messageController,
                  style: const TextStyle(color: warmWhite, fontSize: 14),
                  decoration: const InputDecoration(
                    hintText: 'Type internal memo...',
                    hintStyle: TextStyle(color: Colors.white24, fontSize: 13),
                    border: InputBorder.none,
                    filled: false,
                  ),
                  onSubmitted: (_) => _sendMessage(),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.send, color: goldAccent),
                onPressed: _sendMessage,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
