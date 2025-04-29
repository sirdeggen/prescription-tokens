import { PrivateKey, KeyDeriver, ProtoWallet } from '@bsv/sdk'
import { WalletStorageManager, Services, Wallet, StorageClient } from '@bsv/wallet-toolbox-client'

export const createWallet = async (): Promise<Wallet> => {
    const rootKey = PrivateKey.fromHex(process.env.DOCTOR_ROOT_KEY_HEX!)
    const endpointUrl = process.env.WALLET_STORAGE_URL!
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
    const client = new StorageClient(wallet, endpointUrl)
    await storage.addWalletStorageProvider(client)
    await storage.makeAvailable()
    return wallet
}

const createLocalWallet = (owner: "patient" | "pharmacy"): ProtoWallet => {
    let rootKey: PrivateKey
    if (owner === 'patient') {
        rootKey = PrivateKey.fromString(process.env.PATIENT_ROOT_KEY_HEX!)
    } else if (owner === 'pharmacy') {
        rootKey = PrivateKey.fromString(process.env.PHARMACY_ROOT_KEY_HEX!)
    } else {
        throw new Error('Unknown wallet owner')
    }
    const wallet = new ProtoWallet(rootKey)
    return wallet
}

export const doctor = await createWallet()
export const patient = createLocalWallet('patient')
export const pharmacy = createLocalWallet('pharmacy')
