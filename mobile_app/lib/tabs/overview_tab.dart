import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';

class OverviewTab extends StatelessWidget {
  const OverviewTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    const goldAccent = Color(0xFFF3C65F);
    const warmWhite = Color(0xFFF9F6F0);
    const cardBg = Color(0xFF282828);

    final auth = Provider.of<AuthProvider>(context);
    final user = auth.currentUser!;
    final data = Provider.of<DataProvider>(context);

    // Compute stats
    final activeSitesCount = data.sites.where((s) => s.status == 'Active').length;
    final completedSitesCount = data.sites.where((s) => s.status == 'Completed').length;
    final totalSites = data.sites.length;

    final staffCount = data.users.where((u) => u.role == 'Staff').length;
    final pendingBills = data.bills.where((b) => b.status == 'Pending').length;

    double totalPaymentsAmount = 0.0;
    for (var p in data.payments) {
      if (p.status == 'Paid') {
        totalPaymentsAmount += p.amount;
      }
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Welcome Banner
          Container(
            decoration: BoxDecoration(
              color: goldAccent,
              borderRadius: BorderRadius.circular(16),
              boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 6, offset: Offset(0, 3))],
            ),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hello, ${user.name}!',
                  style: const TextStyle(color: Colors.black87, fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Welcome to your Shree Interiors workspace dashboard.',
                  style: TextStyle(color: Colors.black54, fontSize: 13, height: 1.4),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Statistics Cards Grid
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.25,
            children: [
              _buildStatCard('MY SITES', '$totalSites', '$activeSitesCount Active / $completedSitesCount Completed', Icons.map, cardBg, warmWhite, goldAccent),
              _buildStatCard('STAFF DIRECTORY', '$staffCount', 'Active personnel', Icons.people, cardBg, warmWhite, goldAccent),
              _buildStatCard('PENDING CLAIMS', '$pendingBills', 'Reimbursements pending', Icons.receipt, cardBg, warmWhite, goldAccent),
              _buildStatCard('TOTAL PAYMENTS', '₹${totalPaymentsAmount.toInt()}', 'Disbursed ledger', Icons.account_balance_wallet, cardBg, warmWhite, goldAccent),
            ],
          ),
          const SizedBox(height: 25),

          // Progress Breakdown list (Visual Charts equivalent)
          const Text(
            'ACTIVE SITES CHECKLIST PROGRESS',
            style: TextStyle(color: goldAccent, fontWeight: FontWeight.bold, letterSpacing: 1.1, fontSize: 12),
          ),
          const SizedBox(height: 10),
          if (data.sites.where((s) => s.status == 'Active').isEmpty)
            Container(
              decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.all(20),
              child: const Center(
                child: Text('No active projects found.', style: TextStyle(color: Colors.white54, fontStyle: FontStyle.italic)),
              ),
            )
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: data.sites.where((s) => s.status == 'Active').length,
              itemBuilder: (context, index) {
                final site = data.sites.where((s) => s.status == 'Active').toList()[index];
                
                // Calculate percentage
                int totalItems = site.checklist.length;
                int completedItems = site.checklist.where((c) => c.completed).length;
                double progress = totalItems > 0 ? (completedItems / totalItems) : 0.0;
                int progressPercent = (progress * 100).toInt();

                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              site.name,
                              style: const TextStyle(color: warmWhite, fontWeight: FontWeight.bold, fontSize: 14),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            '$progressPercent%',
                            style: const TextStyle(color: goldAccent, fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: progress,
                          backgroundColor: Colors.white12,
                          color: goldAccent,
                          minHeight: 8,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '$completedItems of $totalItems milestones achieved',
                        style: TextStyle(color: warmWhite.withOpacity(0.5), fontSize: 11),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String count, String subtitle, IconData icon, Color bg, Color text, Color accent) {
    return Container(
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: TextStyle(color: text.withOpacity(0.5), fontSize: 9, fontWeight: FontWeight.bold)),
              Icon(icon, color: accent, size: 18),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(count, style: TextStyle(color: text, fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: TextStyle(color: text.withOpacity(0.4), fontSize: 9),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          )
        ],
      ),
    );
  }
}
