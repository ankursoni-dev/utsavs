/**
 * Utsavs demo seed — idempotent.
 * Creates: Aarav (host) + sharma-2026 wedding event (ROYAL_IVORY) with
 * sub-events, guests, RSVPs, vendors, budget, tasks, and activities.
 *
 * Run: pnpm --filter api prisma:seed
 */
import { PrismaPg } from '@prisma/adapter-pg';
import {
  ActorType,
  BroadcastChannel,
  DietaryPreference,
  EventState,
  EventTheme,
  EventType,
  MemberRole,
  PaymentMethod,
  PrismaClient,
  Priority,
  RiskLevel,
  RsvpStatus,
  TaskStatus,
  TransactionStatus,
  VendorStatus,
} from '@prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const EVENT_SLUG = 'sharma-2026';
const HOST_PHONE = '+919999000001';

async function main(): Promise<void> {
  // ---------------------------------------------------------------------------
  // Idempotency: wipe the event and dependent rows; cascade clears most edges.
  // ---------------------------------------------------------------------------
  const existing = await prisma.event.findUnique({ where: { slug: EVENT_SLUG } });
  if (existing) {
    await prisma.event.delete({ where: { id: existing.id } });
  }

  // ---------------------------------------------------------------------------
  // User: Aarav Sharma (host)
  // ---------------------------------------------------------------------------
  const aarav = await prisma.user.upsert({
    where: { phone: HOST_PHONE },
    update: { name: 'Aarav Sharma', email: 'aarav@example.in' },
    create: {
      phone: HOST_PHONE,
      name: 'Aarav Sharma',
      email: 'aarav@example.in',
    },
  });

  // ---------------------------------------------------------------------------
  // Event: Sharma 2026 wedding
  // ---------------------------------------------------------------------------
  const weddingDate = new Date('2026-12-12T18:30:00.000Z');

  const event = await prisma.event.create({
    data: {
      slug: EVENT_SLUG,
      name: 'Aarav & Priya Wedding',
      type: EventType.WEDDING,
      date: weddingDate,
      venue: 'Taj Palace, ITC Maurya Lawns',
      city: 'New Delhi',
      theme: EventTheme.ROYAL_IVORY,
      state: EventState.BEFORE,
      createdById: aarav.id,
      memberships: {
        create: { userId: aarav.id, role: MemberRole.HOST },
      },
      weddingDetail: {
        create: {
          partner1Name: 'Priya Sharma',
          partner1Label: 'Bride',
          partner2Name: 'Aarav Sharma',
          partner2Label: 'Groom',
          coupleName: 'Aarav & Priya',
          story:
            'Two families, one celebration. Join us as Aarav and Priya begin their forever — across mehendi, sangeet, haldi, the wedding, and a grand reception.',
          hashtag: '#AaravWedsPriya2026',
        },
      },
    },
  });

  // ---------------------------------------------------------------------------
  // SubEvents
  // ---------------------------------------------------------------------------
  const subEventsData = [
    {
      name: 'Mehendi',
      date: new Date('2026-12-10T10:00:00.000Z'),
      time: '10:00 AM',
      venue: 'Sharma Residence, Lawn',
      dressCode: 'Pastel yellows & greens',
      icon: 'leaf',
      sortOrder: 1,
    },
    {
      name: 'Sangeet',
      date: new Date('2026-12-11T19:00:00.000Z'),
      time: '7:00 PM',
      venue: 'Taj Palace, Crystal Ballroom',
      dressCode: 'Indo-western glam',
      icon: 'music',
      sortOrder: 2,
    },
    {
      name: 'Haldi',
      date: new Date('2026-12-12T09:00:00.000Z'),
      time: '9:00 AM',
      venue: 'Taj Palace, Poolside',
      dressCode: 'Yellow ethnic',
      icon: 'sun',
      sortOrder: 3,
    },
    {
      name: 'Wedding Ceremony',
      date: new Date('2026-12-12T18:30:00.000Z'),
      time: '6:30 PM',
      venue: 'Taj Palace, ITC Maurya Lawns',
      dressCode: 'Traditional Indian',
      icon: 'heart',
      sortOrder: 4,
    },
    {
      name: 'Reception',
      date: new Date('2026-12-13T19:30:00.000Z'),
      time: '7:30 PM',
      venue: 'Taj Palace, Grand Ballroom',
      dressCode: 'Black-tie / Indian formal',
      icon: 'sparkles',
      sortOrder: 5,
    },
  ];

  const subEvents: Awaited<ReturnType<typeof prisma.subEvent.create>>[] = [];
  for (const data of subEventsData) {
    const se = await prisma.subEvent.create({
      data: { ...data, eventId: event.id },
    });
    subEvents.push(se);
  }

  // ---------------------------------------------------------------------------
  // Guests (10) — mix of bride/groom side, tags, dietary
  // ---------------------------------------------------------------------------
  const guestsData = [
    {
      name: 'Rohan Sharma',
      phone: '+919999100001',
      group: 'Groom',
      tags: ['Family', 'VIP'],
      dietary: DietaryPreference.VEG,
    },
    {
      name: 'Meera Sharma',
      phone: '+919999100002',
      group: 'Groom',
      tags: ['Family'],
      dietary: DietaryPreference.VEG,
    },
    {
      name: 'Karan Mehta',
      phone: '+919999100003',
      group: 'Groom',
      tags: ['College', 'Friend'],
      dietary: DietaryPreference.NON_VEG,
    },
    {
      name: 'Neha Kapoor',
      phone: '+919999100004',
      group: 'Groom',
      tags: ['Colleague'],
      dietary: DietaryPreference.JAIN,
    },
    {
      name: 'Vikram Singh',
      phone: '+919999100005',
      group: 'Groom',
      tags: ['Friend'],
      dietary: DietaryPreference.NON_VEG,
    },
    {
      name: 'Anjali Sharma',
      phone: '+919999200001',
      group: 'Bride',
      tags: ['Family', 'VIP'],
      dietary: DietaryPreference.VEG,
    },
    {
      name: 'Ravi Sharma',
      phone: '+919999200002',
      group: 'Bride',
      tags: ['Family'],
      dietary: DietaryPreference.VEG,
    },
    {
      name: 'Sneha Iyer',
      phone: '+919999200003',
      group: 'Bride',
      tags: ['College', 'Friend'],
      dietary: DietaryPreference.VEGAN,
    },
    {
      name: 'Aditi Rao',
      phone: '+919999200004',
      group: 'Bride',
      tags: ['Friend'],
      dietary: DietaryPreference.NON_VEG,
    },
    {
      name: 'Pooja Nair',
      phone: '+919999200005',
      group: 'Bride',
      tags: ['Colleague'],
      dietary: DietaryPreference.VEG,
    },
  ];

  const guests: Awaited<ReturnType<typeof prisma.guest.create>>[] = [];
  for (const data of guestsData) {
    const g = await prisma.guest.create({
      data: { ...data, eventId: event.id },
    });
    guests.push(g);
  }

  // ---------------------------------------------------------------------------
  // RSVPs — confirmed for first 5, pending/declined/maybe mix for rest
  // ---------------------------------------------------------------------------
  const rsvpPlan: Array<{ status: RsvpStatus; plusOnes: number }> = [
    { status: RsvpStatus.CONFIRMED, plusOnes: 1 },
    { status: RsvpStatus.CONFIRMED, plusOnes: 1 },
    { status: RsvpStatus.CONFIRMED, plusOnes: 0 },
    { status: RsvpStatus.CONFIRMED, plusOnes: 2 },
    { status: RsvpStatus.CONFIRMED, plusOnes: 0 },
    { status: RsvpStatus.PENDING, plusOnes: 0 },
    { status: RsvpStatus.MAYBE, plusOnes: 1 },
    { status: RsvpStatus.PENDING, plusOnes: 0 },
    { status: RsvpStatus.DECLINED, plusOnes: 0 },
    { status: RsvpStatus.PENDING, plusOnes: 0 },
  ];

  for (let i = 0; i < guests.length; i++) {
    const plan = rsvpPlan[i];
    const guest = guests[i];
    await prisma.rsvp.create({
      data: {
        guestId: guest.id,
        eventId: event.id,
        status: plan.status,
        plusOnes: plan.plusOnes,
        respondedAt: plan.status === RsvpStatus.PENDING ? null : new Date(),
      },
    });
  }

  // Sample contribution (one captured) for a confirmed guest
  await prisma.contribution.create({
    data: {
      eventId: event.id,
      guestId: guests[0].id,
      amountPaise: 1100000, // ₹11,000
      method: PaymentMethod.UPI,
      label: 'Shagun',
      status: TransactionStatus.CAPTURED,
      paymentId: 'pay_DEMO0000000001',
    },
  });

  // ---------------------------------------------------------------------------
  // Vendors (6)
  // ---------------------------------------------------------------------------
  const vendorsData = [
    {
      name: 'Frames Forever Studio',
      type: 'Photographer',
      status: VendorStatus.CONFIRMED,
      totalAmount: 35000000, // ₹3.5L
      paidAmount: 10000000, // ₹1L advance
      rating: 4.8,
      riskLevel: RiskLevel.LOW,
    },
    {
      name: 'Marigold Decor',
      type: 'Decorator',
      status: VendorStatus.CONFIRMED,
      totalAmount: 60000000, // ₹6L
      paidAmount: 15000000,
      rating: 4.6,
      riskLevel: RiskLevel.LOW,
    },
    {
      name: 'Royal Spice Catering',
      type: 'Caterer',
      status: VendorStatus.CONFIRMED,
      totalAmount: 95000000, // ₹9.5L
      paidAmount: 20000000,
      rating: 4.7,
      riskLevel: RiskLevel.MEDIUM,
    },
    {
      name: 'DJ Beat Drop',
      type: 'DJ',
      status: VendorStatus.CONFIRMED,
      totalAmount: 12000000, // ₹1.2L
      paidAmount: 6000000,
      rating: 4.5,
      riskLevel: RiskLevel.LOW,
    },
    {
      name: 'Henna by Hina',
      type: 'Mehendi',
      status: VendorStatus.PENDING,
      totalAmount: 4500000, // ₹45k
      paidAmount: 0,
      rating: 4.9,
      riskLevel: RiskLevel.MEDIUM,
    },
    {
      name: 'Petal & Stem Florists',
      type: 'Florist',
      status: VendorStatus.PENDING,
      totalAmount: 8000000, // ₹80k
      paidAmount: 0,
      rating: null,
      riskLevel: RiskLevel.HIGH,
    },
  ];

  const vendors: Awaited<ReturnType<typeof prisma.vendor.create>>[] = [];
  for (const data of vendorsData) {
    const v = await prisma.vendor.create({
      data: {
        ...data,
        eventId: event.id,
        lastContactAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
    });
    vendors.push(v);
  }

  // A couple of deliverables
  await prisma.vendorDeliverable.create({
    data: {
      vendorId: vendors[0].id,
      description: 'Pre-wedding shoot — outdoor location',
      subEventId: subEvents[0].id,
      completed: true,
    },
  });
  await prisma.vendorDeliverable.create({
    data: {
      vendorId: vendors[0].id,
      description: 'Wedding day full coverage + drone',
      subEventId: subEvents[3].id,
      completed: false,
    },
  });

  // ---------------------------------------------------------------------------
  // Budget items (7)
  // ---------------------------------------------------------------------------
  const budgetData = [
    { category: 'Venue', allocated: 80000000, spent: 30000000, vendorId: null },
    { category: 'Catering', allocated: 100000000, spent: 20000000, vendorId: vendors[2].id },
    { category: 'Decoration', allocated: 65000000, spent: 15000000, vendorId: vendors[1].id },
    { category: 'Photography', allocated: 40000000, spent: 10000000, vendorId: vendors[0].id },
    { category: 'Outfits', allocated: 50000000, spent: 12000000, vendorId: null },
    { category: 'Music', allocated: 15000000, spent: 6000000, vendorId: vendors[3].id },
    { category: 'Misc', allocated: 25000000, spent: 4000000, vendorId: null },
  ];

  for (const data of budgetData) {
    await prisma.budgetItem.create({
      data: { ...data, eventId: event.id },
    });
  }

  // ---------------------------------------------------------------------------
  // Tasks (6)
  // ---------------------------------------------------------------------------
  const tasksData = [
    {
      title: 'Confirm caterer menu (veg + jain)',
      dueDate: new Date('2026-11-20T00:00:00.000Z'),
      status: TaskStatus.PENDING,
      assigneeName: 'Aarav',
      priority: Priority.HIGH,
    },
    {
      title: 'Send save-the-date WhatsApp broadcast',
      dueDate: new Date('2026-09-15T00:00:00.000Z'),
      status: TaskStatus.DONE,
      assigneeName: 'Priya',
      priority: Priority.HIGH,
    },
    {
      title: 'Finalize mehendi artist booking',
      dueDate: new Date('2026-10-30T00:00:00.000Z'),
      status: TaskStatus.OVERDUE,
      assigneeName: 'Anjali',
      priority: Priority.MEDIUM,
    },
    {
      title: 'Order wedding invitations',
      dueDate: new Date('2026-10-01T00:00:00.000Z'),
      status: TaskStatus.DONE,
      assigneeName: 'Aarav',
      priority: Priority.MEDIUM,
    },
    {
      title: 'Block hotel rooms for outstation guests',
      dueDate: new Date('2026-11-01T00:00:00.000Z'),
      status: TaskStatus.PENDING,
      assigneeName: 'Rohan',
      priority: Priority.HIGH,
    },
    {
      title: 'Decide return-gift theme',
      dueDate: new Date('2026-11-25T00:00:00.000Z'),
      status: TaskStatus.PENDING,
      assigneeName: 'Meera',
      priority: Priority.LOW,
    },
  ];

  for (const data of tasksData) {
    await prisma.task.create({
      data: { ...data, eventId: event.id },
    });
  }

  // ---------------------------------------------------------------------------
  // Sample broadcast (already-sent save-the-date)
  // ---------------------------------------------------------------------------
  await prisma.broadcast.create({
    data: {
      eventId: event.id,
      title: 'Save the Date — 12 Dec 2026',
      body: 'Aarav & Priya are tying the knot! Save the date — 12 Dec 2026, Taj Palace, New Delhi. Full schedule on the event page.',
      channel: BroadcastChannel.WHATSAPP,
      sentCount: 10,
      openedCount: 8,
    },
  });

  // ---------------------------------------------------------------------------
  // Activity feed
  // ---------------------------------------------------------------------------
  const activitiesData = [
    {
      actorType: ActorType.SYSTEM,
      action: 'event.created',
      metadata: { slug: EVENT_SLUG } as object,
    },
    {
      actorType: ActorType.GUEST,
      actorId: guests[0].id,
      action: 'rsvp.confirmed',
      metadata: { plusOnes: 1 } as object,
    },
    {
      actorType: ActorType.GUEST,
      actorId: guests[0].id,
      action: 'shagun.received',
      metadata: { amountPaise: 1100000, method: 'UPI' } as object,
    },
    {
      actorType: ActorType.HOST,
      actorId: aarav.id,
      action: 'vendor.confirmed',
      metadata: { vendorName: 'Frames Forever Studio' } as object,
    },
  ];

  for (const data of activitiesData) {
    await prisma.activity.create({
      data: { ...data, eventId: event.id },
    });
  }

  // Fixed OTPs for dev/QA
  await prisma.fixedOtp.upsert({
    where: { phone: '+919999900001' },
    create: { phone: '+919999900001', otp: '123456', label: 'dev-host', isActive: true },
    update: {},
  });
  await prisma.fixedOtp.upsert({
    where: { phone: '+919999900002' },
    create: { phone: '+919999900002', otp: '123456', label: 'dev-guest', isActive: true },
    update: {},
  });
  await prisma.fixedOtp.upsert({
    where: { phone: '+919999900003' },
    create: { phone: '+919999900003', otp: '123456', label: 'dev-organizer', isActive: true },
    update: {},
  });

  console.log(
    `Seeded event "${event.slug}" (${event.id}): ${subEvents.length} sub-events, ${guests.length} guests, ${vendors.length} vendors.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
