
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
      
      const spend = createPrescriptionQueue[0]

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
  
        console.log(beef.toLogString())
  
        if (tokens.totalOutputs > 0) {
          // pick the output to spend based on available tokens matching this keyID
          const output = tokens.outputs.find(output => {
            const c = JSON.parse(output.customInstructions as string)
            console.log({ c, customInstructions })
            return customInstructions.keyID === c.keyID
          })
          console.log({ output })
          if (output) {
            const [txid, voutStr] = output.outpoint.split('.')
            const vout = parseInt(voutStr)
            console.log({ txid, vout })
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
      // if (step !== 'Create Prescription') {
      //   const output = inputs?.[0].outpoint as string
      //   console.log({ output })
      //   await doctorWallet.relinquishOutput({
      //     basket: 'prescription',
      //     output
      //   })
      // }
      return { txid: res.txid as string, arc }
    }
  