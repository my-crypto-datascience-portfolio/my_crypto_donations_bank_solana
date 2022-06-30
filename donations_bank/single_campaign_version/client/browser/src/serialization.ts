import lo from "buffer-layout"
// import BN from "bn.js"

//export interface Counter {
//  counter: number
//  value: BN
//}

export interface Settings {
  admin: number[]
  creator_fee_account: number[]
  test_stub1: number
  test_stub2: number
  period_n: number,
  active_state: number,
  last_time_reward: number,
  creator_fee_size: number,
  top10_reward_size: number,
  chrt_limit_no_fee: number,
  chrt_limit_hard_cap: number

//  pub active_state: u8,
//  pub last_time_reward: f64,
//  pub creator_fee_size: u8,
//  pub top10_reward_size: u32,
//  pub chrt_limit_no_fee: u32,
//  pub chrt_limit_hard_cap: u32,  
}

enum ToaPayohBankIxOrder {
  CreateDonationSlot = 0,
  SealDonation = 1,
  Inc = 2,
  Dec = 3,
  ToaPayohBankSettings = 4,
}

// const counterSchema = lo.struct([lo.u32("counter"), lo.ns64("value")])
const settingsSchema = lo.struct([
  lo.seq(lo.u8(), 32, "admin"),
  lo.seq(lo.u8(), 32, "creator_fee_account"),
  lo.u32("test_stub1"),
  lo.u32("test_stub2"),
  lo.u8("period_n"),
  lo.u8("active_state"),
  lo.f64("last_time_reward"),
  lo.u8("creator_fee_size"),
  lo.u32("top10_reward_size"),
  lo.u32("chrt_limit_no_fee"),
  lo.u32("chrt_limit_hard_cap"),

//  pub active_state: u8,
//  pub last_time_reward: f64,
//  pub creator_fee_size: u8,
//  pub top10_reward_size: u32,
//  pub chrt_limit_no_fee: u32,
//  pub chrt_limit_hard_cap: u32,

])

//const settingsSchemaToaPayohBank = lo.struct([
//  lo.seq(lo.u8(), 32, "admin"),
//  lo.u32("inc_step"),
//  lo.u32("dec_step"),
//])

//export function encodeCounter(counter: number, value: BN): Buffer {
//  const b = Buffer.alloc(4 + 8)
//  counterSchema.encode({ counter, value }, b)
//  return b
//}

//export function decodeCounter(data: Buffer): Counter {
//  return counterSchema.decode(data)
//}

export function decodeSettings(data: Buffer): Settings {
  return settingsSchema.decode(data)
}

export function encodeIncIx(): Buffer {
  return Buffer.from([ToaPayohBankIxOrder.Inc])
}

export function encodeDecIx(): Buffer {
  return Buffer.from([ToaPayohBankIxOrder.Dec])
}
/*
export function encodeUpdateSettingsIx(
  admin: Uint8Array,
  inc_step: number,
  dec_step: number
): Buffer {
  const schema = lo.struct([lo.seq(lo.u8(), 32, "admin"), lo.u32("inc_step"), lo.u32("dec_step")])
  const b = Buffer.alloc(32 + 4 + 4)
  schema.encode({ admin, inc_step, dec_step }, b)
  return Buffer.from([ToaPayohBankIxOrder.ToaPayohBankSettings, ...b])
}
*/

export function encodeSettingsToaPayohBank(
  admin: Uint8Array,
  creator_fee_account: Uint8Array,
  test_stub1: number,
  test_stub2: number,
  period_n: number,
  active_state: number,
  last_time_reward: number,
  creator_fee_size: number,
  top10_reward_size: number,
  chrt_limit_no_fee: number,
  chrt_limit_hard_cap: number

//  pub active_state: u8,
//  pub last_time_reward: f64,
//  pub creator_fee_size: u8,
//  pub top10_reward_size: u32,
//  pub chrt_limit_no_fee: u32,
//  pub chrt_limit_hard_cap: u32,

  
): Buffer {
  const schema = lo.struct([lo.seq(lo.u8(), 32, "admin"), lo.seq(lo.u8(), 32, "creator_fee_account"), 
  lo.u32("test_stub1"), lo.u32("test_stub2"), 
  lo.u8("period_n"), lo.u8("active_state"), lo.f64("last_time_reward"), lo.u8("creator_fee_size"),   
  lo.u32("top10_reward_size"), lo.u32("chrt_limit_no_fee"), lo.u32("chrt_limit_hard_cap")])

  const b = Buffer.alloc(32 + 32 + 4 + 4 + 1 + 1 + 8 + 1 + 4 + 4 + 4) 
  schema.encode({ admin, creator_fee_account, test_stub1, test_stub2, period_n, active_state, last_time_reward, creator_fee_size, top10_reward_size, 
    chrt_limit_no_fee, chrt_limit_hard_cap }, b)
  return Buffer.from([ToaPayohBankIxOrder.ToaPayohBankSettings, ...b])
}