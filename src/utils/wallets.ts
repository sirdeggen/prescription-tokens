import { PrivateKey, KeyDeriver, ProtoWallet, WalletClient } from '@bsv/sdk'
import { WalletStorageManager, Services, Wallet, StorageClient } from '@bsv/wallet-toolbox-client'

const doctorKey = process.env.NEXT_PUBLIC_DOCTOR_KEY!
const patientKey = process.env.NEXT_PUBLIC_PATIENT_KEY!
const pharmacyKey = process.env.NEXT_PUBLIC_PHARMACY_KEY!
const walletStorageUrl = process.env.NEXT_PUBLIC_WALLET_STORAGE_URL!

export const createWalletClient = async (): Promise<WalletClient> => {
    const rootKey = PrivateKey.fromHex(doctorKey)
    const keyDeriver = new KeyDeriver(rootKey)
    const storage = new WalletStorageManager(keyDeriver.identityKey)
    const chain = 'main'
    const services = new Services(chain)
    const wallet = new Wallet({
        chain,
        keyDeriver,
        storage,
        services,
    })
    const client = new StorageClient(wallet, walletStorageUrl)
    await storage.addWalletStorageProvider(client)
    await storage.makeAvailable()
    return new WalletClient(wallet)
}

const createLocalWallet = (owner: "patient" | "pharmacy"): ProtoWallet => {
    let rootKey: PrivateKey
    if (owner === 'patient') {
        rootKey = PrivateKey.fromHex(patientKey)
    } else if (owner === 'pharmacy') {
        rootKey = PrivateKey.fromHex(pharmacyKey)
    } else {
        throw new Error('Unknown wallet owner')
    }
    const wallet = new ProtoWallet(rootKey)
    return wallet
}

export const doctor = await createWalletClient()
export const patient = createLocalWallet('patient')
export const pharmacy = createLocalWallet('pharmacy')
