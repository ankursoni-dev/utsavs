/**
 * Shared enums between Prisma (backend) and the frontend.
 *
 * Implemented as `const` objects + type unions (not TypeScript `enum`s) so
 * values are available at runtime without `enum`'s emit overhead, and types
 * are nominal string-literal unions that serialize cleanly.
 *
 * The string values MUST match the Prisma enum values in
 * `apps/api/prisma/schema.prisma` exactly.
 */

export const EventType = {
  WEDDING: 'WEDDING',
  BIRTHDAY: 'BIRTHDAY',
  ANNIVERSARY: 'ANNIVERSARY',
  RETIREMENT: 'RETIREMENT',
  CUSTOM: 'CUSTOM',
} as const;
export type EventType = (typeof EventType)[keyof typeof EventType];

export const EventTheme = {
  ROYAL_IVORY: 'ROYAL_IVORY',
  MODERN_EMERALD: 'MODERN_EMERALD',
  MIDNIGHT_SANGEET: 'MIDNIGHT_SANGEET',
  MINIMAL_LUXURY: 'MINIMAL_LUXURY',
  FLORAL_SUNSET: 'FLORAL_SUNSET',
  TEMPLE_CLASSIC: 'TEMPLE_CLASSIC',
} as const;
export type EventTheme = (typeof EventTheme)[keyof typeof EventTheme];

export const EventState = {
  BEFORE: 'BEFORE',
  DURING: 'DURING',
  AFTER: 'AFTER',
} as const;
export type EventState = (typeof EventState)[keyof typeof EventState];

export const MemberRole = {
  HOST: 'HOST',
  ORGANIZER: 'ORGANIZER',
  GUEST: 'GUEST',
} as const;
export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole];

export const DietaryPreference = {
  VEG: 'VEG',
  NON_VEG: 'NON_VEG',
  JAIN: 'JAIN',
  VEGAN: 'VEGAN',
} as const;
export type DietaryPreference = (typeof DietaryPreference)[keyof typeof DietaryPreference];

export const RsvpStatus = {
  CONFIRMED: 'CONFIRMED',
  PENDING: 'PENDING',
  DECLINED: 'DECLINED',
  MAYBE: 'MAYBE',
} as const;
export type RsvpStatus = (typeof RsvpStatus)[keyof typeof RsvpStatus];

export const PaymentMethod = {
  UPI: 'UPI',
  CARD: 'CARD',
  NET_BANKING: 'NET_BANKING',
  CASH: 'CASH',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const TransactionStatus = {
  INITIATED: 'INITIATED',
  CAPTURED: 'CAPTURED',
  SETTLED: 'SETTLED',
  FAILED: 'FAILED',
} as const;
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

export const VendorStatus = {
  CONFIRMED: 'CONFIRMED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
} as const;
export type VendorStatus = (typeof VendorStatus)[keyof typeof VendorStatus];

export const RiskLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;
export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];

export const TaskStatus = {
  PENDING: 'PENDING',
  DONE: 'DONE',
  OVERDUE: 'OVERDUE',
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const Priority = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;
export type Priority = (typeof Priority)[keyof typeof Priority];

export const BroadcastChannel = {
  WHATSAPP: 'WHATSAPP',
  SMS: 'SMS',
  PUSH: 'PUSH',
} as const;
export type BroadcastChannel = (typeof BroadcastChannel)[keyof typeof BroadcastChannel];

export const ActorType = {
  GUEST: 'GUEST',
  HOST: 'HOST',
  SYSTEM: 'SYSTEM',
} as const;
export type ActorType = (typeof ActorType)[keyof typeof ActorType];
