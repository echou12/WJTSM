// lib/mock-data.ts
// MOCK DATA: Used when DB is not connected or for UI prototyping
// Replace with real API calls in production

export const mockDashboardStats = {
  today: {
    totalDeposits: 103700,
    totalWithdrawals: 66800,
    netBalance: 36900,
    houseProfit: 5185,
    activePlayers: 8,
    newPlayers: 2,
  },
  vip: {
    deposits: 95000,
    withdrawals: 63000,
    net: 32000,
    players: [
      { id: '1', name: 'João Mendes', phone: '+55 11 99999-0001', status: 'vip', deposit: 50000, withdrawal: 35000, houseProfit: 2500, hasActivity: true },
      { id: '2', name: 'Maria Santos', phone: '+55 11 99999-0002', status: 'vip', deposit: 30000, withdrawal: 20000, houseProfit: 1500, hasActivity: true },
      { id: '6', name: 'Camila Rocha', phone: '+55 41 99999-0006', status: 'vip', deposit: 15000, withdrawal: 8000, houseProfit: 750, hasActivity: true },
      // No activity VIP
      { id: '9', name: 'Victor Nunes', phone: '+55 11 99999-0009', status: 'vip', deposit: 0, withdrawal: 0, houseProfit: 0, hasActivity: false },
    ],
  },
  groups: [
    {
      groupName: 'VIP Gold',
      consultant: 'Carlos Silva',
      deposits: 95000,
      withdrawals: 63000,
      net: 32000,
      players: [
        { id: '1', name: 'João Mendes', phone: '+55 11 99999-0001', status: 'vip', deposit: 50000, withdrawal: 35000, houseProfit: 2500, hasActivity: true },
        { id: '2', name: 'Maria Santos', phone: '+55 11 99999-0002', status: 'vip', deposit: 30000, withdrawal: 20000, houseProfit: 1500, hasActivity: true },
        { id: '6', name: 'Camila Rocha', phone: '+55 41 99999-0006', status: 'vip', deposit: 15000, withdrawal: 8000, houseProfit: 750, hasActivity: true },
      ],
    },
    {
      groupName: 'Silver Club',
      consultant: 'Ana Costa',
      deposits: 8700,
      withdrawals: 3800,
      net: 4900,
      players: [
        { id: '3', name: 'Pedro Lima', phone: '+55 21 99999-0003', status: 'active', deposit: 5000, withdrawal: 3000, houseProfit: 250, hasActivity: true },
        { id: '4', name: 'Fernanda Cruz', phone: '+55 31 99999-0004', status: 'active', deposit: 2500, withdrawal: 0, houseProfit: 125, hasActivity: true },
        { id: '8', name: 'Lucia Oliveira', phone: '+55 51 99999-0008', status: 'active', deposit: 1200, withdrawal: 800, houseProfit: 60, hasActivity: true },
        // No activity
        { id: '10', name: 'Bruno Martins', phone: '+55 11 99999-0010', status: 'active', deposit: 0, withdrawal: 0, houseProfit: 0, hasActivity: false },
      ],
    },
  ],
  weekly: [
    { day: 'Seg', deposits: 45000, withdrawals: 32000 },
    { day: 'Ter', deposits: 62000, withdrawals: 41000 },
    { day: 'Qua', deposits: 38000, withdrawals: 28000 },
    { day: 'Qui', deposits: 71000, withdrawals: 55000 },
    { day: 'Sex', deposits: 89000, withdrawals: 67000 },
    { day: 'Sáb', deposits: 103700, withdrawals: 66800 },
    { day: 'Dom', deposits: 0, withdrawals: 0 },
  ],
}

export const mockUsers = [
  { id: '1', name: 'Admin', email: 'admin@tsm.com', role: 'superadmin', isActive: true, createdAt: '2024-01-01' },
  { id: '2', name: 'Eddie', email: 'eddie@tsm.com', role: 'manager', isActive: true, createdAt: '2024-01-15' },
  { id: '3', name: 'Carlos Silva', email: 'carlos@tsm.com', role: 'consultant', isActive: true, createdAt: '2024-02-01' },
  { id: '4', name: 'Ana Costa', email: 'ana@tsm.com', role: 'consultant', isActive: true, createdAt: '2024-02-15' },
]

export const mockPlayers = [
  { id: '1', name: 'João Mendes', phone: '+55 11 99999-0001', email: null, status: 'vip', vipLevel: 5, groupName: 'VIP Gold', consultant: 'Carlos Silva', isBlacklisted: false, deposit: 50000, withdrawal: 35000 },
  { id: '2', name: 'Maria Santos', phone: '+55 11 99999-0002', email: null, status: 'vip', vipLevel: 4, groupName: 'VIP Gold', consultant: 'Carlos Silva', isBlacklisted: false, deposit: 30000, withdrawal: 20000 },
  { id: '3', name: 'Pedro Lima', phone: '+55 21 99999-0003', email: null, status: 'active', vipLevel: 2, groupName: 'Silver Club', consultant: 'Ana Costa', isBlacklisted: false, deposit: 5000, withdrawal: 3000 },
  { id: '4', name: 'Fernanda Cruz', phone: '+55 31 99999-0004', email: null, status: 'active', vipLevel: 1, groupName: 'Silver Club', consultant: 'Ana Costa', isBlacklisted: false, deposit: 2500, withdrawal: 0 },
  { id: '5', name: 'Ricardo Alves', phone: '+55 11 99999-0005', email: null, status: 'inactive', vipLevel: 0, groupName: null, consultant: 'Carlos Silva', isBlacklisted: false, deposit: 0, withdrawal: 0 },
  { id: '6', name: 'Camila Rocha', phone: '+55 41 99999-0006', email: null, status: 'vip', vipLevel: 3, groupName: 'VIP Gold', consultant: 'Carlos Silva', isBlacklisted: false, deposit: 15000, withdrawal: 8000 },
  { id: '7', name: 'Marcos Ferreira', phone: '+55 11 99999-0007', email: null, status: 'blacklisted', vipLevel: 0, groupName: null, consultant: null, isBlacklisted: true, deposit: 0, withdrawal: 0 },
  { id: '8', name: 'Lucia Oliveira', phone: '+55 51 99999-0008', email: null, status: 'active', vipLevel: 1, groupName: 'Silver Club', consultant: 'Ana Costa', isBlacklisted: false, deposit: 1200, withdrawal: 800 },
]

export const mockGroups = [
  { id: 'group-vip-1', name: 'VIP Gold', consultant: 'Carlos Silva', playerCount: 3, totalDeposits: 95000, totalWithdrawals: 63000, isActive: true },
  { id: 'group-silver-1', name: 'Silver Club', consultant: 'Ana Costa', playerCount: 3, totalDeposits: 8700, totalWithdrawals: 3800, isActive: true },
]

export const mockReports = {
  monthly: [
    { month: 'Jan', deposits: 320000, withdrawals: 240000, profit: 80000 },
    { month: 'Fev', deposits: 410000, withdrawals: 290000, profit: 120000 },
    { month: 'Mar', deposits: 380000, withdrawals: 270000, profit: 110000 },
    { month: 'Abr', deposits: 450000, withdrawals: 310000, profit: 140000 },
    { month: 'Mai', deposits: 520000, withdrawals: 380000, profit: 140000 },
    { month: 'Jun', deposits: 490000, withdrawals: 350000, profit: 140000 },
  ],
  byGroup: [
    { group: 'VIP Gold', deposits: 850000, withdrawals: 610000, profit: 240000, playerCount: 3 },
    { group: 'Silver Club', deposits: 320000, withdrawals: 240000, profit: 80000, playerCount: 4 },
    { group: 'Sem Grupo', deposits: 120000, withdrawals: 90000, profit: 30000, playerCount: 2 },
  ],
}
