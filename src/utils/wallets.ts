import { PrivateKey, KeyDeriver, ProtoWallet, WalletClient } from '@bsv/sdk'
import { WalletStorageManager, Services, Wallet, StorageClient } from '@bsv/wallet-toolbox-client'

const doctorKey = import.meta.env.VITE_DOCTOR_KEY!
const patientKey = import.meta.env.VITE_PATIENT_KEY!
const pharmacyKey = import.meta.env.VITE_PHARMACY_KEY!
const walletStorageUrl = import.meta.env.VITE_WALLET_STORAGE_URL!

export const doctorIdentityKey = PrivateKey.fromHex(doctorKey).toPublicKey().toString()
export const patientIdentityKey = PrivateKey.fromHex(patientKey).toPublicKey().toString()
export const pharmacyIdentityKey = PrivateKey.fromHex(pharmacyKey).toPublicKey().toString()

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

export const doctorPromise = createWalletClient()
export const patient = createLocalWallet('patient')
export const pharmacy = createLocalWallet('pharmacy')