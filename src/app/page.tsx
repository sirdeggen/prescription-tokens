"use client"
import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Backdrop } from '@mui/material';
import CreatePrescriptionCard from '../components/stages/CreatePrescriptionCard';
import CollectMedicationCard from '../components/stages/CollectMedicationCard'
import ResultBox from '../components/ResultBox';
import { Utils, Hash, PushDrop, WalletProtocol, Random, Transaction, HTTPWalletJSON, ARC, CreateActionInput, Beef, BEEF, WalletInterface, WalletClient, CreateActionOutput, LockingScript } from '@bsv/sdk'
import SubmissionsLog from '@/components/SubmissionsLog';
import { saveSubmission, getAllSubmissions } from '@/utils/db';
import prescriptions from '@/utils/prescriptions.json';

export interface DataEntry {
  entryId: string;
  timestamp: string;
  patient?: {
    patientId: string;
    name: string;
    dateOfBirth: string;
  };
  prescriber?: {
    prescriberNPI: string;
    name: string;
    clinic: string;
  };
  medication?: {
    medicationName: string;
    ndc: string;
    dosage: string;
    quantity: number;
    refills: number;
    instructions: string;
    expirationDate: string;
  };
  pharmacy?: {
    pharmacyNPI: string;
    name: string;
    pharmacist: string;
    dispensedDate: string;
  };
  [key: string]: unknown;
}

export interface QueueEntry {
  data: DataEntry;
  txid: string;
  step: string;
}

export interface Submission {
  data: DataEntry;
  txid: string;
  step: string;
  arc: unknown;
}

type BitailsResponse = {
  txid: string;
  outputs: Array<{
    index: number;
    spent: string;
  }>;
}

const App: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [createPrescriptionQueue, setCreatePrescriptionQueue] = useState<QueueEntry[]>([]);
  const [collectMedicationQueue, setCollectMedicationQueue] = useState<QueueEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState<string | null>(null);

  const checkUnspentSetQueues = async (submissions: Submission[]) => {
    const txsIds = submissions.map(s => s.txid)
    const bitails: BitailsResponse[] = await (await fetch('https://api.bitails.io/tx/multi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txsIds })
    })).json()
    console.log({bitails})
    const unspentSubmissions = submissions.filter(s => {
      const tx = bitails.find(b => b?.txid === s.txid)
      console.log({ s: s.txid, spent: !!tx?.outputs[0].spent })
      return !tx?.outputs[0].spent
    })
    const prescriptionQueue: QueueEntry[] = []
    const collectMedicationQueue: QueueEntry[] = []
    if (unspentSubmissions.length > 0) {
      // add unspent tokens to the appropriate queue
      unspentSubmissions.forEach(token => {
        switch (token.step) {
          case 'Create Prescription':
            prescriptionQueue.push(token)
            break
          case 'Collect Medication':
            collectMedicationQueue.push(token)
            break
        }
      })
    }
    return { prescriptionQueue, collectMedicationQueue }
  }

  // Load submissions from IndexedDB
  const loadSubmissions = async () => {
    try {
      const submissions = await getAllSubmissions();
      if (submissions && submissions.length > 0) {
        // check for unspent tokens:
        const { prescriptionQueue, collectMedicationQueue } = await checkUnspentSetQueues(submissions)
        setSubmissions(submissions);          
        setCreatePrescriptionQueue(prescriptionQueue)
        setCollectMedicationQueue(collectMedicationQueue)
      }
    } catch (error) {
      console.error('Failed to load submissions from IndexedDB:', error);
    }
  };


  useEffect(() => {
    loadSubmissions();
  }, []);

  const grabTokenFromPreviousStep = async (step: string) => {
    if (step === 'Collect Medication') {
      return createPrescriptionQueue[0]
    }
    return undefined
  }

  const handleSubmitData = async (step: string) => {
    try {
      setIsSubmitting(true);
      setSubmittingStep(step);
      
      let d: DataEntry
      if (step === 'Create Prescription') {
        d = simulatedData()
        const entryId = Utils.toBase64(Random(8))
        d.entryId = entryId
        d.timestamp = new Date().toISOString()
      } else {
        d = {
          entryId: Utils.toBase64(Random(8)),
          timestamp: new Date().toISOString()
        }
      }

      const data: DataEntry = d
      

      const spend = await grabTokenFromPreviousStep(step)

      const { txid, arc } = await createTokenOnBSV(data, step, spend)

      const newSubmission = { step, data, txid, arc };
      
      // Save to IndexedDB
      try {
        await saveSubmission(newSubmission);
      } catch (error) {
        console.error('Failed to save submission to IndexedDB:', error);
      }
      
      setSubmissions(prev => [...prev, newSubmission]);

      switch (step) {
        case 'Create Prescription':
          setCreatePrescriptionQueue((prev) => [...prev, { data, txid, step }])
          break
        case 'Collect Medication':
          setCollectMedicationQueue((prev) => [...prev, { data, txid, step }])
          setCreatePrescriptionQueue((prev) => prev.slice(1))
          break
      }
    } catch (error) {
      console.error('Error submitting data:', error);
    } finally {
      setIsSubmitting(false);
      setSubmittingStep(null);
    }
  }

  /**
   * Simulates data by adding 10% random variability to numeric values in the example data
   * @param data The example data to be varied
   * @returns The simulated data
   */
  function simulatedData(): DataEntry {
    return prescriptions[Math.floor(Math.random() * prescriptions.length)] as DataEntry
  }

  /**
   * Uses the BSV Blockchain to create a token capturing the data as a hash, timestamping it, 
   * and assigning ownership to the token which represents the medical prescription.
   * 
   * @param data The data to be stored
   * @param step The step of the process
   * @returns The transaction ID and broadcast response
   */
  async function createTokenOnBSV(data: DataEntry, step: string, spend?: QueueEntry | null): Promise<{ txid: string, arc: unknown }> {
    const patientWallet = new WalletClient('json-api', 'prescriptions.vercel.app')
    const { publicKey: patientPublicKey } = await patientWallet.getPublicKey({ identityKey: true })
    const doctorWallet = new HTTPWalletJSON('https://prescription-tokens.vercel.app', 'https://prescription-tokens.vercel.app/api')
    const { publicKey: doctorPublicKey } = await doctorWallet.getPublicKey({ identityKey: true })
    
    let wallet: WalletInterface
    let counterparty: string
    if (step === 'Create Prescription') {
      wallet = doctorWallet
      counterparty = patientPublicKey
    } else {
      wallet = patientWallet
      counterparty = doctorPublicKey
    }

    let outputs: CreateActionOutput[] | undefined = undefined
    let inputs: CreateActionInput[] | undefined = undefined
    let inputBEEF: BEEF | undefined = undefined
    const pushdrop = new PushDrop(wallet)
    if (spend) {
      const sha = Hash.sha256(JSON.stringify(spend.data))
      const customInstructions = {
        protocolID: [0, 'medical prescription'] as WalletProtocol,
        keyID: Utils.toBase64(sha),
        counterparty
      }
      const tokens = await doctorWallet.listOutputs({
        basket: 'prescription',
        includeCustomInstructions: true,
        include: 'entire transactions',
        limit: 1000
      })

      console.log({ outputs: tokens.outputs })

      const beef = Beef.fromBinary(tokens.BEEF as number[])

      if (tokens.totalOutputs > 0) {
        // pick the output to spend based on available tokens matching this keyID
        const output = tokens.outputs.find(output => {
          const c = JSON.parse(output.customInstructions as string)
          return customInstructions.keyID === c.keyID
        })
        if (output) {
          const [txid, voutStr] = output.outpoint.split('.')
          const vout = parseInt(voutStr)
          const sourceTransaction = beef.findAtomicTransaction(txid) as Transaction
          // Spend the current state of the token to create an immutable chain of custody
          const unlockingScriptTemplate = pushdrop.unlock(
            customInstructions.protocolID,
            customInstructions.keyID,
            counterparty,
            'all',
            true,
            1,
            sourceTransaction.outputs[vout].lockingScript
          )
          const txDummy = new Transaction()
          txDummy.addInput({
            sourceTransaction,
            sourceOutputIndex: vout,
            unlockingScriptTemplate
          })
          txDummy.addOutput({
            lockingScript: LockingScript.fromASM('OP_FALSE OP_RETURN'),
            satoshis: 0,
          })
          await txDummy.sign()
          console.log({ txDummy: txDummy.toHex() })
          if (!inputs) {
            inputs = []
          }
          const nb = new Beef()
          nb.mergeTransaction(sourceTransaction)
          console.log(nb.toLogString())
          inputBEEF = nb.toBinary()
          inputs.push({
            unlockingScript: txDummy.inputs[0].unlockingScript?.toHex() as string,
            outpoint: output.outpoint,
            inputDescription: 'medical prescription token'
          })
        }
      }
    } else {
      // Create a hash of the data
      const sha = Hash.sha256(JSON.stringify(data))
      const shasha = Hash.sha256(sha)

      // Create a new pushdrop token
      const customInstructions = {
          protocolID: [0, 'medical prescription'] as WalletProtocol,
          keyID: Utils.toBase64(sha),
          counterparty
      }

      // Create a locking script for the pushdrop token
      const lockingScript = await pushdrop.lock(
        [Utils.toArray(step, 'utf8'), shasha],
        customInstructions.protocolID,
        customInstructions.keyID,
        counterparty,
        true,
        true,
        'after'
      )

      outputs = [{
        lockingScript: lockingScript.toHex(),
        satoshis: 1,
        outputDescription: 'medical prescription token',
        customInstructions: JSON.stringify(customInstructions),
        basket: 'prescription'
      }]
    }

    const res = await wallet.createAction({
      inputBEEF,
      description: 'Tracking the creation and fullfilment of a prescription',
      inputs,
      outputs,
      options: {
        randomizeOutputs: false
      }
    })
    const tx = Transaction.fromAtomicBEEF(res.tx as number[])
    const arc = await tx.broadcast(new ARC('https://arc.taal.com', {
      headers: {
        'X-WaitFor': 'SEEN_ON_NETWORK'
      }
    }))
    console.log({ arc })
    console.log({ inputs })
    if (step !== 'Create Prescription') {
      const output = inputs?.[0].outpoint as string
      console.log({ output })
      await doctorWallet.relinquishOutput({
        basket: 'prescription',
        output
      })
    }
    return { txid: res.txid as string, arc }
  }

  const boxSx = {
    display: 'flex',
    gap: 2,
    alignItems: 'center',
    flexDirection: { xs: 'column', md: 'row' }
  };

  const cardSx = {
    width: { xs: '100%', sm: '100%', md: '50%', lg: '40%' },
    minWidth: { md: '350px' },
    flexShrink: 0
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, minHeight: '100vh', display: 'flex', flexDirection: 'column', pt: 10, pb: 40, bgcolor: '#f8fbfd' }}>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSubmitting}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          bgcolor: 'rgba(0,0,0,0.7)',
          p: 3,
          borderRadius: 2
        }}>
          <CircularProgress color="primary" />
          <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
            {submittingStep ? `Processing ${submittingStep}...` : 'Processing...'}
          </Typography>
        </Box>
      </Backdrop>
      <Typography variant="h4" align="center" color="#2c6e8e" gutterBottom sx={{ py: 5, fontWeight: 'bold', textShadow: '1px 1px 1px rgba(0,0,0,0.1)' }}>
        Medical Prescription Blockchain Demo
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={boxSx}>
          <Box sx={cardSx}><CreatePrescriptionCard onSubmit={handleSubmitData} /></Box>
          <ResultBox entry={createPrescriptionQueue[createPrescriptionQueue.length - 1]} />
        </Box>
        <Box sx={boxSx}>
          <Box sx={cardSx}><CollectMedicationCard onSubmit={handleSubmitData} /></Box>
          <ResultBox entry={collectMedicationQueue[collectMedicationQueue.length - 1]} />
        </Box>
      </Box>
      <SubmissionsLog submissions={submissions} />
    </Container>
  );
};

export default App;
