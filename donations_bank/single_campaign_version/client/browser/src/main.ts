import { readFileSync } from "fs"
import {
  Keypair,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js"
import {
  //Counter,
  //decodeCounter,
  decodeSettings,
  //encodeCounter,
  encodeDecIx,
  encodeIncIx,
  //encodeUpdateSettingsIx,
  Settings,
  encodeSettingsToaPayohBank,
} from "./serialization"
import "regenerator-runtime/runtime"
import {Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction,} from "@solana/web3.js"
import Wallet from "@project-serum/sol-wallet-adapter"

declare global {
  interface Window {
    solana: any
  }
}

enum Status {
  Initialization = '⏳ Initializing the blockchain, creating the genesis block...',
  AddTransaction = '💸 Add one or more transactions.',
  ReadyToMine    = '✅ Ready to mine a new block.',
  MineInProgress = '⏳ Mining a new block...',

  WalletConnection = '⏳ Initializing the Sollet wallet, connecting...',

  ReadyToUpload    = '✅ Ready to upload the settings to blockchain.',

  WalletConfirmation = '⏳ Please, confirm the Tx on the Sollet wallet...',

}


let solletWallet = new Wallet("https://www.sollet.io", "testnet")
solletWallet.on("connect", (publicKey) => 
{
  if (solletWallet.publicKey != null)
  {  
    console.log("sollet connected", publicKey.toBase58())
    statusEl.textContent = Status.ReadyToUpload;
  
    creatorEl.value = solletWallet.publicKey.toString()
    setupBtn.disabled = false
    solletBtn.disabled = true

  }
})

const solletBtn              = document.getElementById('sollet') as HTMLButtonElement;
const setupBtn               = document.getElementById('setup') as HTMLButtonElement;

const statusEl               = document.getElementById('status') as HTMLParagraphElement;

const creatorEl              = document.getElementById('creator') as HTMLInputElement;
const period_nEl             = document.getElementById('period_n') as HTMLInputElement;
const creator_fee_sizeEl     = document.getElementById('creator_fee_size') as HTMLInputElement;
const top10_reward_sizeEl    = document.getElementById('top10_reward_size') as HTMLInputElement;
const chrt_limit_no_feeEl    = document.getElementById('chrt_limit_no_fee') as HTMLInputElement;
const chrt_limit_hard_capEl  = document.getElementById('chrt_limit_hard_cap') as HTMLInputElement;

// comission
// period_n
// creator_fee_size
// top10_reward_size
// chrt_limit_no_fee
// chrt_limit_hard_cap

// confirm

// setupBtn.addEventListener('click', setupSettings);

export async function connectSolletWallet() {

  statusEl.textContent = Status.WalletConnection;
  await solletWallet.connect()
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class App {

      static settingsSeed = "settings"

      connection: Connection
      settingsPubkey: PublicKey

      adminKeypair = new PublicKey("9C8ARBpAqcmoDfqZTDtvB1JgZC7gjvcq48xRJoR7Wpeq")  // STUB
//      programId = new PublicKey("6m2pPzxLgzyMjG1ogG8KL5c2LytpkhADFZphZkYmW9KH") 
      programId = new PublicKey("GNTFL1xWLBjTE5KrW9iWh44UtPrhcW92jgRb2igXMg2W") // programID on testnet

      constructor() {

        if (solletWallet.publicKey != null)
          this.adminKeypair = new PublicKey(solletWallet.publicKey.toString())

//        this.connection = new Connection("http://localhost:8899", "confirmed")
        this.connection = new Connection("https://api.testnet.solana.com", "confirmed")

        this.settingsPubkey = new PublicKey(0)
      }

      async init() {
       // this.counterPubkey = await PublicKey.createWithSeed(
       //   this.userKeypair.publicKey,
       //   App.counterSeed,
       //   this.programKeypair.publicKey
       // )
        this.settingsPubkey = (
          await PublicKey.findProgramAddress(
            [Buffer.from(App.settingsSeed, "utf-8")],
            this.programId
          )
        )[0]
        const res = await this.connection.getAccountInfo(this.programId)
        if (!res) {
          console.error("ToaPayoh Bank is not deployed. Deploy it first.")
          process.exit(1)
        }
        console.log("program", this.programId.toBase58())
        console.log("admin", this.adminKeypair.toBase58())
        // console.log("user", this.userKeypair.publicKey.toBase58())
        console.log("settings", this.settingsPubkey.toBase58())
        // console.log("counter", this.settingsPubkey.toBase58())
      }

      async readSettingsAccount(): Promise<Settings> {
        const account = await this.connection.getAccountInfo(this.settingsPubkey)
        if (!account) {
          console.error("settings account is not found")
          process.exit(1)
        }
        console.log("SettingsAccount owner:", account.owner.toBase58())
        console.log("SettingsAccount data:", account.data.toString())
        console.log("admin:", decodeSettings(account.data).admin.toString())
        console.log("creator fee account:", decodeSettings(account.data).creator_fee_account.toString())
        console.log("period_n:", decodeSettings(account.data).period_n.toString())
        console.log("test_stub1:", decodeSettings(account.data).test_stub1.toString())
        console.log("test_stub2:", decodeSettings(account.data).test_stub2.toString())

        console.log("active_state:", decodeSettings(account.data).active_state.toString())
        console.log("last_time_reward:", decodeSettings(account.data).last_time_reward.toString())
        console.log("creator_fee_size:", decodeSettings(account.data).creator_fee_size.toString())
        console.log("top10_reward_size:", decodeSettings(account.data).top10_reward_size.toString())
        console.log("chrt_limit_no_fee:", decodeSettings(account.data).chrt_limit_no_fee.toString())
        console.log("chrt_limit_hard_cap:", decodeSettings(account.data).chrt_limit_hard_cap.toString())


        return decodeSettings(account.data)
      }

    
      async updateToaPayohBankSettings(admin: Uint8Array, test_stub1: number, test_stub2: number, period_n: number,
        active_state: number, last_time_reward: number, creator_fee_size: number, top10_reward_size: number, 
        chrt_limit_no_fee: number, chrt_limit_hard_cap: number,) {
        //if (solletWallet.publicKey != null)
        //{

          const updateSettingsIx = new TransactionInstruction({
            programId: this.programId,
            keys: [
              {
                pubkey: this.adminKeypair,
                isSigner: true,
                isWritable: true,
              },
              { pubkey: this.settingsPubkey, isSigner: false, isWritable: true },
              { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
              { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            ],
            data: encodeSettingsToaPayohBank(admin, admin, test_stub1, test_stub2, period_n,
              active_state, last_time_reward, creator_fee_size, top10_reward_size, chrt_limit_no_fee, chrt_limit_hard_cap),
          })

          let tx = new Transaction().add(updateSettingsIx)
          tx.feePayer = this.adminKeypair
          tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash

          return tx
      }

      async broadcastSignedTransaction(signed) {
        let signature = await this.connection.sendRawTransaction(signed.serialize())
        console.log("Submitted transaction " + signature + ", awaiting confirmation")
        await this.connection.confirmTransaction(signature)
        console.log("Transaction " + signature + " confirmed")
      }

}

export async function setupSettings() {
  console.log("setupSettings called")

  if (solletWallet.publicKey != null)
  {
      creatorEl.value = solletWallet.publicKey.toString()

      const app = new App()
      await app.init()
      
       // period_n - setup
      let period_n = "1" // default - period in days
      if (period_nEl.value.length != 0)
          period_n = period_nEl.value;
      
      var pn = parseInt(period_n, 10);
      console.log("period_n_num: ", pn.toString())


      // creator_fee_size - setup
      let creator_fee_size = "5" // default - 5%
      if (creator_fee_sizeEl.value.length != 0)
          creator_fee_size = creator_fee_sizeEl.value;
      
      var crfs = parseInt(creator_fee_size, 10);
      console.log("creator_fee_size_num: ", crfs.toString())

      // top10_reward_size - setup
      let top10_reward_size = "100000" // default - 100000 CHRT
      if (top10_reward_sizeEl.value.length != 0)
          top10_reward_size = top10_reward_sizeEl.value;
      
      var t10rz = parseInt(top10_reward_size, 10);
      console.log("top10_reward_size: ", t10rz.toString())


      statusEl.textContent = Status.WalletConfirmation;
// 
// 
// chrt_limit_no_fee
// chrt_limit_hard_cap

//  pub active_state: u8,
//  pub last_time_reward: f64,
//  pub creator_fee_size: u8,
//  pub top10_reward_size: u32,
//  pub chrt_limit_no_fee: u32,
//  pub chrt_limit_hard_cap: u32,

/*
      const tx = await app.updateToaPayohBankSettings(solletWallet.publicKey.toBytes(), 98, 19, 11, 1, 0, 2, 3, 4, 5)     

      let signed = await solletWallet.signTransaction(tx)
      

      await app.broadcastSignedTransaction(signed)
      
      await delay(3000)

      await app.readSettingsAccount()
      */

  }
}



function toggleState(confirmation: boolean, transferForm: boolean): void {
  //if(recipientEl != null)
  //    transferBtn.disabled = amountEl.disabled = senderEl.disabled = recipientEl.disabled = transferForm;
  //confirmBtn.disabled = confirmation;
  setupBtn.disabled = false;
}