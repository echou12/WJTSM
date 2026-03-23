// prisma/seed.ts
// Run: npx tsx prisma/seed.ts
// Creates superadmin + demo data

import { PrismaClient, UserRole, PlayerStatus, TransferType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── SUPER ADMIN ───────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Admin@2026!', 12)

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@tsm.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@tsm.com',
      password: hashedPassword,
      role: UserRole.superadmin,
      isActive: true,
    },
  })
  console.log('✅ Super Admin created:', superAdmin.email)

  // ─── DEMO MANAGER ──────────────────────────────────────────────────────────
  const managerPass = await bcrypt.hash('Manager@123!', 12)
  const manager = await prisma.user.upsert({
    where: { email: 'eddie@tsm.com' },
    update: {},
    create: {
      name: 'Eddie',
      email: 'eddie@tsm.com',
      password: managerPass,
      role: UserRole.manager,
      isActive: true,
    },
  })

  // ─── DEMO CONSULTANTS ──────────────────────────────────────────────────────
  const consultantPass = await bcrypt.hash('Consultant@123!', 12)
  const consultant1 = await prisma.user.upsert({
    where: { email: 'carlos@tsm.com' },
    update: {},
    create: {
      name: 'Carlos Silva',
      email: 'carlos@tsm.com',
      password: consultantPass,
      role: UserRole.consultant,
      isActive: true,
    },
  })

  const consultant2 = await prisma.user.upsert({
    where: { email: 'ana@tsm.com' },
    update: {},
    create: {
      name: 'Ana Costa',
      email: 'ana@tsm.com',
      password: consultantPass,
      role: UserRole.consultant,
      isActive: true,
    },
  })

  // ─── GROUPS ────────────────────────────────────────────────────────────────
  const group1 = await prisma.group.upsert({
    where: { id: 'group-vip-1' },
    update: {},
    create: {
      id: 'group-vip-1',
      name: 'VIP Gold',
      description: 'Top tier VIP players',
      consultantId: consultant1.id,
    },
  })

  const group2 = await prisma.group.upsert({
    where: { id: 'group-silver-1' },
    update: {},
    create: {
      id: 'group-silver-1',
      name: 'Silver Club',
      description: 'Mid tier players',
      consultantId: consultant2.id,
    },
  })

  // ─── PLAYERS ───────────────────────────────────────────────────────────────
  const playersData = [
    { name: 'João Mendes', phone: '+55 11 99999-0001', status: PlayerStatus.vip, vipLevel: 5, groupId: group1.id, consultantId: consultant1.id },
    { name: 'Maria Santos', phone: '+55 11 99999-0002', status: PlayerStatus.vip, vipLevel: 4, groupId: group1.id, consultantId: consultant1.id },
    { name: 'Pedro Lima', phone: '+55 21 99999-0003', status: PlayerStatus.active, vipLevel: 2, groupId: group2.id, consultantId: consultant2.id },
    { name: 'Fernanda Cruz', phone: '+55 31 99999-0004', status: PlayerStatus.active, vipLevel: 1, groupId: group2.id, consultantId: consultant2.id },
    { name: 'Ricardo Alves', phone: '+55 11 99999-0005', status: PlayerStatus.inactive, vipLevel: 0, groupId: null, consultantId: consultant1.id },
    { name: 'Camila Rocha', phone: '+55 41 99999-0006', status: PlayerStatus.vip, vipLevel: 3, groupId: group1.id, consultantId: consultant1.id },
    { name: 'Marcos Ferreira', phone: '+55 11 99999-0007', status: PlayerStatus.blacklisted, vipLevel: 0, groupId: null, consultantId: null, isBlacklisted: true },
    { name: 'Lucia Oliveira', phone: '+55 51 99999-0008', status: PlayerStatus.active, vipLevel: 1, groupId: group2.id, consultantId: consultant2.id },
  ]

  const players: any[] = []
  for (const p of playersData) {
    const player = await prisma.player.create({ data: p as any })
    players.push(player)
  }
  console.log(`✅ Created ${players.length} players`)

  // ─── TRANSFERS ─────────────────────────────────────────────────────────────
  const now = new Date()
  const transfers = [
    // João Mendes - VIP
    { playerId: players[0].id, type: TransferType.deposit, amount: 50000, houseProfit: 2500 },
    { playerId: players[0].id, type: TransferType.withdrawal, amount: 35000, houseProfit: 0 },
    // Maria Santos - VIP
    { playerId: players[1].id, type: TransferType.deposit, amount: 30000, houseProfit: 1500 },
    { playerId: players[1].id, type: TransferType.withdrawal, amount: 20000, houseProfit: 0 },
    // Pedro Lima
    { playerId: players[2].id, type: TransferType.deposit, amount: 5000, houseProfit: 250 },
    { playerId: players[2].id, type: TransferType.withdrawal, amount: 3000, houseProfit: 0 },
    // Fernanda Cruz
    { playerId: players[3].id, type: TransferType.deposit, amount: 2500, houseProfit: 125 },
    // Camila Rocha - VIP
    { playerId: players[5].id, type: TransferType.deposit, amount: 15000, houseProfit: 750 },
    { playerId: players[5].id, type: TransferType.withdrawal, amount: 8000, houseProfit: 0 },
    // Lucia Oliveira
    { playerId: players[7].id, type: TransferType.deposit, amount: 1200, houseProfit: 60 },
    { playerId: players[7].id, type: TransferType.withdrawal, amount: 800, houseProfit: 0 },
  ]

  for (const t of transfers) {
    await prisma.transfer.create({
      data: { ...t, transferAt: new Date(now.getTime() - Math.random() * 86400000) },
    })
  }
  console.log(`✅ Created ${transfers.length} transfers`)

  // ─── CONTACT LOGS ──────────────────────────────────────────────────────────
  await prisma.contactLog.createMany({
    data: [
      { playerId: players[0].id, note: 'Called to confirm withdrawal. Player satisfied.' },
      { playerId: players[1].id, note: 'Sent bonus offer via WhatsApp.' },
      { playerId: players[2].id, note: 'Player asked about VIP upgrade criteria.' },
    ],
  })

  console.log('🎉 Seed complete!')
  console.log('')
  console.log('─────────────────────────────────────────')
  console.log('  SUPER ADMIN LOGIN:')
  console.log('  Username: admin@tsm.com')
  console.log('  Password: Admin@2026!')
  console.log('─────────────────────────────────────────')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
