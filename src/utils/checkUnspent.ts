import { Submission, QueueEntry } from "@/app/page"

export type BitailsResponse = {
  txid: string;
  outputs: Array<{
    index: number;
    spent: string;
  }>;
}

export const checkUnspentSetQueues = async (submissions: Submission[]) => {
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
