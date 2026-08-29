export type UserRole = 'Admin' | 'Manager' | 'Staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  password?: string; // stored for demo settings reset
  adminKey?: string; // special authorization key for creating Master Admin
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  percentage: number;
  description: string;
  dateUpdated?: string;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  gmapLink: string;
  checklist: ChecklistItem[];
  managerId: string; // assigned manager id
  staffIds: string[]; // assigned staff ids
  startDate: string;
  status: 'Active' | 'Completed';
}

export interface Attendance {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  siteId: string;
  siteName: string;
  type: 'In' | 'Out';
  timestamp: string;
  latitude: number;
  longitude: number;
  isSimulated: boolean;
  distance: number; // distance in meters to site
}

export interface WorkDone {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  siteId: string;
  siteName: string;
  photoUrl: string; // base64 or image url
  description: string;
  timestamp: string;
  reviewText?: string; // manager review of staff
}

export interface Bill {
  id: string;
  managerId: string;
  managerName: string;
  siteId: string;
  siteName: string;
  photoUrl: string; // base64 or image/pdf url
  description: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp: string;
  dateApproved?: string;
}

export interface Payment {
  id: string;
  type: 'Salary' | 'Bill';
  userId: string;
  userName: string;
  role: UserRole;
  siteId?: string;
  siteName?: string;
  billId?: string;
  amount: number;
  status: 'Pending' | 'Paid';
  description: string;
  dateUpdated: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string; // 'All' or specific user id or 'Admin'
  recipientName: string;
  text: string;
  timestamp: string;
  isAdminOnly: boolean;
}

// Pre-seeded Demo Data
const DEMO_USERS: User[] = [
  { id: 'usr-admin', email: 'admin@shreeinteriors.com', name: 'Founder Admin', role: 'Admin', phone: '9941387939', password: 'admin123' },
  { id: 'usr-mgr1', email: 'manager@shreeinteriors.com', name: 'Rajesh Kumar', role: 'Manager', phone: '8015509036', password: 'manager123' },
  { id: 'usr-mgr2', email: 'anand@shreeinteriors.com', name: 'Anand R', role: 'Manager', phone: '9840123456', password: 'password' },
  { id: 'usr-staff1', email: 'staff@shreeinteriors.com', name: 'Suresh Pillai', role: 'Staff', phone: '9003112233', password: 'staff123' },
  { id: 'usr-staff2', email: 'staff2@shreeinteriors.com', name: 'Karthik S', role: 'Staff', phone: '9884556677', password: 'password' },
];

const DEMO_SITES: Site[] = [
  {
    id: 'site-1',
    name: 'T-Nagar Residential Penthouse',
    address: 'No 15, G.N. Chetty Road, T-Nagar, Chennai - 600017',
    latitude: 13.0418,
    longitude: 80.2341,
    gmapLink: 'https://maps.google.com/?q=13.0418,80.2341',
    startDate: '2026-08-10',
    status: 'Active',
    managerId: 'usr-mgr1',
    staffIds: ['usr-staff1', 'usr-staff2'],
    checklist: [
      { id: 'chk-1-1', text: 'Modular Kitchen Cabinet Installation', completed: true, percentage: 100, description: 'All base and wall cabinets mounted successfully.' },
      { id: 'chk-1-2', text: 'Living Room False Ceiling Framework', completed: true, percentage: 100, description: 'Metal framing is ready.' },
      { id: 'chk-1-3', text: 'False Ceiling Gypsum Boarding & Wiring', completed: false, percentage: 65, description: 'Wiring pulled. Gypsum boarding is currently underway.' },
      { id: 'chk-1-4', text: 'Master Bedroom Wardrobe Construction', completed: false, percentage: 20, description: 'Ply board cutting started.' },
    ]
  },
  {
    id: 'site-2',
    name: 'Adyar Office Space Design',
    address: '3rd Floor, LB Road, Adyar, Chennai - 600020',
    latitude: 12.9975,
    longitude: 80.2520,
    gmapLink: 'https://maps.google.com/?q=12.9975,80.2520',
    startDate: '2026-08-15',
    status: 'Active',
    managerId: 'usr-mgr2',
    staffIds: ['usr-staff2'],
    checklist: [
      { id: 'chk-2-1', text: 'Glass Partition Installations', completed: false, percentage: 40, description: 'Channel frames completed. Awaiting glass panes delivery.' },
      { id: 'chk-2-2', text: 'Reception Desk Carpentry', completed: true, percentage: 100, description: 'Polishing completed.' }
    ]
  },
  {
    id: 'site-3',
    name: 'Anna Nagar Villa Renovation',
    address: 'Block Y, 5th Avenue, Anna Nagar, Chennai - 600040',
    latitude: 13.0850,
    longitude: 80.2101,
    gmapLink: 'https://maps.google.com/?q=13.0850,80.2101',
    startDate: '2026-06-01',
    status: 'Completed',
    managerId: 'usr-mgr1',
    staffIds: ['usr-staff1'],
    checklist: [
      { id: 'chk-3-1', text: 'Whole House Painting & Deco', completed: true, percentage: 100, description: 'Final coat finished. Client signed off.' },
      { id: 'chk-3-2', text: 'Lighting Fixtures Setup', completed: true, percentage: 100, description: 'LED spotlights and central chandelier installed.' }
    ]
  }
];

const DEMO_ATTENDANCE: Attendance[] = [
  { id: 'att-1', userId: 'usr-mgr1', userName: 'Rajesh Kumar', role: 'Manager', siteId: 'site-1', siteName: 'T-Nagar Residential Penthouse', type: 'In', timestamp: '2026-08-28T09:15:00Z', latitude: 13.0419, longitude: 80.2340, isSimulated: false, distance: 15 },
  { id: 'att-2', userId: 'usr-staff1', userName: 'Suresh Pillai', role: 'Staff', siteId: 'site-1', siteName: 'T-Nagar Residential Penthouse', type: 'In', timestamp: '2026-08-28T09:30:00Z', latitude: 13.0418, longitude: 80.2342, isSimulated: false, distance: 10 },
  { id: 'att-3', userId: 'usr-staff2', userName: 'Karthik S', role: 'Staff', siteId: 'site-1', siteName: 'T-Nagar Residential Penthouse', type: 'In', timestamp: '2026-08-28T09:40:00Z', latitude: 13.0418, longitude: 80.2341, isSimulated: true, distance: 0 },
];

const DEMO_BILLS: Bill[] = [
  { id: 'bill-1', managerId: 'usr-mgr1', managerName: 'Rajesh Kumar', siteId: 'site-1', siteName: 'T-Nagar Residential Penthouse', amount: 4500, description: 'Purchased extra wiring boxes and screws from local hardware store.', status: 'Approved', timestamp: '2026-08-27T17:30:00Z', photoUrl: 'https://res.cloudinary.com/demo/image/upload/v1580977265/sample.jpg' },
  { id: 'bill-2', managerId: 'usr-mgr1', managerName: 'Rajesh Kumar', siteId: 'site-1', siteName: 'T-Nagar Residential Penthouse', amount: 12500, description: 'Gypsum Board panels (25 sheets) urgent delivery.', status: 'Pending', timestamp: '2026-08-28T11:00:00Z', photoUrl: 'https://res.cloudinary.com/demo/image/upload/v1580977265/sample.jpg' },
];

const DEMO_PAYMENTS: Payment[] = [
  { id: 'pay-1', type: 'Salary', userId: 'usr-mgr1', userName: 'Rajesh Kumar', role: 'Manager', amount: 35000, status: 'Paid', description: 'Monthly Salary - July 2026', dateUpdated: '2026-08-05' },
  { id: 'pay-2', type: 'Salary', userId: 'usr-staff1', userName: 'Suresh Pillai', role: 'Staff', amount: 18000, status: 'Paid', description: 'Monthly Salary - July 2026', dateUpdated: '2026-08-05' },
  { id: 'pay-3', type: 'Bill', userId: 'usr-mgr1', userName: 'Rajesh Kumar', role: 'Manager', billId: 'bill-1', amount: 4500, status: 'Paid', description: 'Hardware materials reimbursement', dateUpdated: '2026-08-28' },
  { id: 'pay-4', type: 'Salary', userId: 'usr-staff2', userName: 'Karthik S', role: 'Staff', amount: 18000, status: 'Pending', description: 'Advance payment request', dateUpdated: '2026-08-28' }
];

const DEMO_CHAT: ChatMessage[] = [
  { id: 'msg-1', senderId: 'usr-staff1', senderName: 'Suresh Pillai', senderRole: 'Staff', recipientId: 'usr-mgr1', recipientName: 'Rajesh Kumar', text: 'Sir, paint stock is running low at T-Nagar site. We need primer tomorrow morning.', timestamp: '2026-08-28T10:00:00Z', isAdminOnly: false },
  { id: 'msg-2', senderId: 'usr-mgr1', senderName: 'Rajesh Kumar', senderRole: 'Manager', recipientId: 'usr-staff1', recipientName: 'Suresh Pillai', text: 'Got it Suresh, I have ordered 3 buckets of primer. It will reach by 9 AM tomorrow.', timestamp: '2026-08-28T10:05:00Z', isAdminOnly: false },
  { id: 'msg-3', senderId: 'usr-mgr1', senderName: 'Rajesh Kumar', senderRole: 'Manager', recipientId: 'usr-admin', recipientName: 'Founder Admin', text: 'Admin, please approve the Gypsum board bill uploaded today. It is critical for master bedroom.', timestamp: '2026-08-28T11:15:00Z', isAdminOnly: false },
  { id: 'msg-4', senderId: 'usr-staff2', senderName: 'Karthik S', senderRole: 'Staff', recipientId: 'usr-admin', recipientName: 'Founder Admin', text: 'Requesting personal leave on Monday due to urgent family matters.', timestamp: '2026-08-28T11:30:00Z', isAdminOnly: true }
];

// Helper to initialize and retrieve from localStorage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(`shree_db_${key}`);
  if (!item) {
    localStorage.setItem(`shree_db_${key}`, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(item) as T;
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(`shree_db_${key}`, JSON.stringify(value));
};

const rawUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

const getHeaders = () => {
  const token = localStorage.getItem('shree_token') || '';
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const syncWithBackend = async (): Promise<boolean> => {
  const token = localStorage.getItem('shree_token');
  if (!token) return false;
  try {
    const [usersRes, sitesRes, attRes, wdRes, billsRes, payRes, chatRes] = await Promise.all([
      fetch(`${API_URL}/api/users`, { headers: getHeaders() }),
      fetch(`${API_URL}/api/sites`, { headers: getHeaders() }),
      fetch(`${API_URL}/api/attendance`, { headers: getHeaders() }),
      fetch(`${API_URL}/api/workdone`, { headers: getHeaders() }),
      fetch(`${API_URL}/api/bills`, { headers: getHeaders() }),
      fetch(`${API_URL}/api/payments`, { headers: getHeaders() }),
      fetch(`${API_URL}/api/chat`, { headers: getHeaders() }),
    ]);

    if (usersRes.ok) setStorageItem('users', await usersRes.json());
    if (sitesRes.ok) setStorageItem('sites', await sitesRes.json());
    if (attRes.ok) setStorageItem('attendance', await attRes.json());
    if (wdRes.ok) setStorageItem('workdone', await wdRes.json());
    if (billsRes.ok) setStorageItem('bills', await billsRes.json());
    if (payRes.ok) setStorageItem('payments', await payRes.json());
    if (chatRes.ok) setStorageItem('chat', await chatRes.json());

    return true;
  } catch (err) {
    console.error('Failed to sync with backend:', err);
    return false;
  }
};

// Background synchronization helpers
const syncUsers = async (newUsers: User[], oldUsers: User[]) => {
  const oldMap = new Map(oldUsers.map(u => [u.id, u]));
  const newMap = new Map(newUsers.map(u => [u.id, u]));

  for (const u of newUsers) {
    const old = oldMap.get(u.id);
    if (!old) {
      // Create user
      try {
        await fetch(`${API_URL}/api/users`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            email: u.email,
            name: u.name,
            role: u.role,
            phone: u.phone,
            password: u.password || 'password123',
            admin_key: u.adminKey
          })
        });
      } catch (e) { console.error('Add user error:', e); }
    } else {
      // Update user
      if (old.name !== u.name || old.email !== u.email || old.phone !== u.phone || old.role !== u.role || (u.password && u.password !== old.password)) {
        try {
          await fetch(`${API_URL}/api/users/${u.id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({
              email: u.email,
              name: u.name,
              role: u.role,
              phone: u.phone,
              password: u.password
            })
          });
        } catch (e) { console.error('Update user error:', e); }
      }
    }
  }

  for (const u of oldUsers) {
    if (!newMap.has(u.id)) {
      // Delete user
      try {
        await fetch(`${API_URL}/api/users/${u.id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
      } catch (e) { console.error('Delete user error:', e); }
    }
  }
};

const syncSites = async (newSites: Site[], oldSites: Site[]) => {
  const oldMap = new Map(oldSites.map(s => [s.id, s]));
  const newMap = new Map(newSites.map(s => [s.id, s]));

  for (const s of newSites) {
    const old = oldMap.get(s.id);
    if (!old) {
      // Create site
      try {
        await fetch(`${API_URL}/api/sites`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(s)
        });
      } catch (e) { console.error('Add site error:', e); }
    } else {
      // Update site
      // Check if modified
      if (JSON.stringify(old) !== JSON.stringify(s)) {
        try {
          await fetch(`${API_URL}/api/sites/${s.id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(s)
          });
        } catch (e) { console.error('Update site error:', e); }
      }
    }
  }

  for (const s of oldSites) {
    if (!newMap.has(s.id)) {
      // Delete site
      try {
        await fetch(`${API_URL}/api/sites/${s.id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
      } catch (e) { console.error('Delete site error:', e); }
    }
  }
};

const syncAttendance = async (newLogs: Attendance[], oldLogs: Attendance[]) => {
  const oldIds = new Set(oldLogs.map(l => l.id));
  for (const log of newLogs) {
    if (!oldIds.has(log.id)) {
      // Create attendance log
      try {
        await fetch(`${API_URL}/api/attendance`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            siteId: log.siteId,
            siteName: log.siteName,
            type: log.type,
            latitude: log.latitude,
            longitude: log.longitude,
            isSimulated: log.isSimulated,
            distance: log.distance
          })
        });
      } catch (e) { console.error('Add attendance error:', e); }
    }
  }
};

const syncWorkDone = async (newWds: WorkDone[], oldWds: WorkDone[]) => {
  const oldMap = new Map(oldWds.map(w => [w.id, w]));
  for (const wd of newWds) {
    const old = oldMap.get(wd.id);
    if (!old) {
      // Create workdone
      try {
        await fetch(`${API_URL}/api/workdone`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            siteId: wd.siteId,
            siteName: wd.siteName,
            photoUrl: wd.photoUrl,
            description: wd.description
          })
        });
      } catch (e) { console.error('Add workdone error:', e); }
    } else {
      // Review update
      if (old.reviewText !== wd.reviewText && wd.reviewText) {
        try {
          await fetch(`${API_URL}/api/workdone/${wd.id}/review`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ reviewText: wd.reviewText })
          });
        } catch (e) { console.error('Review workdone error:', e); }
      }
    }
  }
};

const syncBills = async (newBills: Bill[], oldBills: Bill[]) => {
  const oldMap = new Map(oldBills.map(b => [b.id, b]));
  for (const b of newBills) {
    const old = oldMap.get(b.id);
    if (!old) {
      // Create bill
      try {
        await fetch(`${API_URL}/api/bills`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            siteId: b.siteId,
            siteName: b.siteName,
            amount: b.amount,
            description: b.description,
            photoUrl: b.photoUrl
          })
        });
      } catch (e) { console.error('Add bill error:', e); }
    } else {
      // Status update
      if (old.status !== b.status) {
        try {
          await fetch(`${API_URL}/api/bills/${b.id}/review`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status: b.status })
          });
        } catch (e) { console.error('Review bill error:', e); }
      }
    }
  }
};

const syncPayments = async (newPays: Payment[], oldPays: Payment[]) => {
  const oldMap = new Map(oldPays.map(p => [p.id, p]));
  for (const p of newPays) {
    const old = oldMap.get(p.id);
    if (!old) {
      // Create payment
      try {
        await fetch(`${API_URL}/api/payments`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            type: p.type,
            userId: p.userId,
            userName: p.userName,
            role: p.role,
            siteId: p.siteId,
            siteName: p.siteName,
            billId: p.billId,
            amount: p.amount,
            status: p.status,
            description: p.description
          })
        });
      } catch (e) { console.error('Add payment error:', e); }
    } else {
      // Update status
      if (old.status !== p.status) {
        try {
          await fetch(`${API_URL}/api/payments/${p.id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status: p.status })
          });
        } catch (e) { console.error('Update payment error:', e); }
      }
    }
  }
};

const syncChatMessages = async (newMsgs: ChatMessage[], oldMsgs: ChatMessage[]) => {
  const oldIds = new Set(oldMsgs.map(m => m.id));
  for (const m of newMsgs) {
    if (!oldIds.has(m.id)) {
      // Create chat message
      try {
        await fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            recipientId: m.recipientId,
            recipientName: m.recipientName,
            text: m.text,
            isAdminOnly: m.isAdminOnly
          })
        });
      } catch (e) { console.error('Add chat error:', e); }
    }
  }
};

// DB exports API client
export const db = {
  // Users
  getUsers: (): User[] => getStorageItem('users', DEMO_USERS),
  setUsers: (users: User[]): void => {
    const old = getStorageItem('users', DEMO_USERS);
    setStorageItem('users', users);
    syncUsers(users, old).then(() => syncWithBackend());
  },
  
  // Sites
  getSites: (): Site[] => getStorageItem('sites', DEMO_SITES),
  setSites: (sites: Site[]): void => {
    const old = getStorageItem('sites', DEMO_SITES);
    setStorageItem('sites', sites);
    syncSites(sites, old).then(() => syncWithBackend());
  },
  
  // Attendance
  getAttendance: (): Attendance[] => getStorageItem('attendance', DEMO_ATTENDANCE),
  setAttendance: (logs: Attendance[]): void => {
    const old = getStorageItem('attendance', DEMO_ATTENDANCE);
    setStorageItem('attendance', logs);
    syncAttendance(logs, old).then(() => syncWithBackend());
  },
  
  // Work Done
  getWorkDone: (): WorkDone[] => getStorageItem('workdone', []),
  setWorkDone: (records: WorkDone[]): void => {
    const old = getStorageItem('workdone', []);
    setStorageItem('workdone', records);
    syncWorkDone(records, old).then(() => syncWithBackend());
  },
  
  // Bills
  getBills: (): Bill[] => getStorageItem('bills', DEMO_BILLS),
  setBills: (bills: Bill[]): void => {
    const old = getStorageItem('bills', DEMO_BILLS);
    setStorageItem('bills', bills);
    syncBills(bills, old).then(() => syncWithBackend());
  },
  
  // Payments
  getPayments: (): Payment[] => getStorageItem('payments', DEMO_PAYMENTS),
  setPayments: (payments: Payment[]): void => {
    const old = getStorageItem('payments', DEMO_PAYMENTS);
    setStorageItem('payments', payments);
    syncPayments(payments, old).then(() => syncWithBackend());
  },
  
  // Chat
  getChatMessages: (): ChatMessage[] => getStorageItem('chat', DEMO_CHAT),
  setChatMessages: (messages: ChatMessage[]): void => {
    const old = getStorageItem('chat', DEMO_CHAT);
    setStorageItem('chat', messages);
    syncChatMessages(messages, old).then(() => syncWithBackend());
  },
  
  // Real network-based delete user function
  deleteUser: async (userId: string, adminKey?: string): Promise<boolean> => {
    try {
      const keyQuery = adminKey ? `?admin_key=${adminKey}` : '';
      const res = await fetch(`${API_URL}/api/users/${userId}${keyQuery}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        // Update local storage cache
        const users = getStorageItem('users', DEMO_USERS).filter(u => u.id !== userId);
        setStorageItem('users', users);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Delete user error:', e);
      return false;
    }
  }
};

// Real network-based login function
export const login = async (email: string, password_str: string): Promise<User | null> => {
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password: password_str })
    });
    if (!res.ok) return null;
    const data = await res.json();
    
    // Save token and user details
    localStorage.setItem('shree_token', data.access_token);
    const apiUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      phone: data.user.phone,
      password: password_str // store for settings tab UI compatibility if needed
    };
    setActiveUserSession(apiUser);
    
    // Run full sync to get fresh data from server MongoDB
    await syncWithBackend();
    
    return apiUser;
  } catch (err) {
    console.error('Login error:', err);
    return null;
  }
};

// Authentication state helpers (Client Session)
export const getActiveUserSession = (): User | null => {
  const session = localStorage.getItem('shree_session');
  return session ? JSON.parse(session) as User : null;
};

export const setActiveUserSession = (user: User | null): void => {
  if (user) {
    localStorage.setItem('shree_session', JSON.stringify(user));
  } else {
    localStorage.removeItem('shree_session');
    localStorage.removeItem('shree_token');
  }
};
