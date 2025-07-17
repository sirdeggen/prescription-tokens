import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Token } from '../components/types';
import { Transaction } from '@bsv/sdk';
import { doctorPromise } from '../utils/wallets';

// Define the structure of our context
interface BroadcastContextType {
    queue: Token[];
    addToQueue: (t: Token) => void;
    removeFromQueue: (txid: string) => void;
    clearQueue: () => void;
    prescription: Token | null;
    setPrescription: (token: Token | null) => void;
    presentation: Token | null;
    setPresentation: (token: Token | null) => void;
    dispensation: Token | null;
    setDispensation: (token: Token | null) => void;
    acknowledgement: Token | null;
    setAcknowledgement: (token: Token | null) => void;
    isSubmitting: boolean;
    setIsSubmitting: (isSubmitting: boolean) => void;
    isProcessing: string;
}

// Create the context with a default value
const BroadcastContext = createContext<BroadcastContextType>({
    queue: [],
    addToQueue: () => { },
    removeFromQueue: () => { },
    clearQueue: () => { },
    prescription: null,
    setPrescription: () => { },
    presentation: null,
    setPresentation: () => { },
    dispensation: null,
    setDispensation: () => { },
    acknowledgement: null,
    setAcknowledgement: () => { },
    isSubmitting: false,
    setIsSubmitting: () => { },
    isProcessing: ''
});

// Custom hook for using the broadcast context
export const useBroadcast = () => useContext(BroadcastContext);

// Props for the provider component
interface BroadcastProviderProps {
    children: ReactNode;
}

const broadcast = async (tx: Transaction) => {
    try {
        const beef = tx.toBEEF()
        const response = await fetch('https://arc.gorillapool.io/v1/tx', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'Accept': 'application/json',
            },
            body: new Blob([new Uint8Array(beef)]),
        })
        if (!response.ok) {
            throw new Error('Failed to broadcast transaction')
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error broadcasting transaction:', error)
        throw error
    }
}


// Create the provider component
export const BroadcastProvider: React.FC<BroadcastProviderProps> = ({ children }) => {
    const [queue, setQueue] = useState<Token[]>([]);
    const [isProcessing, setIsProcessing] = useState('');
    const [prescription, setPrescription] = useState<Token | null>(null)
    const [presentation, setPresentation] = useState<Token | null>(null)
    const [dispensation, setDispensation] = useState<Token | null>(null)
    const [acknowledgement, setAcknowledgement] = useState<Token | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Add a transaction to the queue
    const addToQueue = (t: Token) => {
        setQueue((prevQueue) => [...prevQueue, t]);
    };

    // Process the next item in the queue
    const processNextItem = useCallback(async () => {
        if (queue.length === 0 || isProcessing) return;

        try {
            // Get the first item in the queue
            const itemToProcess = queue[0];
            setIsProcessing(itemToProcess.txid);

            // Broadcast the transaction
            const tx = Transaction.fromBEEF(itemToProcess.tx)
            const response = await broadcast(tx);
            console.log({ response })
            if (response.status === 200) {
                // everything went well
                // only do this if we're on the first step
                if (itemToProcess.data.estado === 'creado') {
                    const doctor = await doctorPromise
                    await Promise.allSettled(tx.inputs.map(async input => {
                        await doctor.relinquishOutput({
                            basket: 'default',
                            output: itemToProcess.txid + '.' + input.sourceOutputIndex
                        })
                    }))
                }
            }

            // Remove the processed item from the queue
            setQueue(prevQueue => prevQueue.slice(1));

        } catch (error) {
            console.error('Error processing queue item:', error);
            // In case of error, keep the item in the queue or implement retry logic
            // Alternatively, remove failing items to prevent queue blockage
            setQueue(prevQueue => prevQueue.slice(1));
        } finally {
            setIsProcessing('');
        }
    }, [queue, isProcessing]);

    // Monitor the queue and process items
    useEffect(() => {
        if (queue.length > 0 && !isProcessing) {
            processNextItem();
        }
    }, [queue, isProcessing, processNextItem]);

    // Remove a transaction from the queue
    const removeFromQueue = (txid: string) => {
        setQueue((prevQueue) =>
            prevQueue.filter((t) => t.txid !== txid)
        );
    };

    // Clear the entire queue
    const clearQueue = () => {
        setQueue([]);
    };

    return (
        <BroadcastContext.Provider
            value={{
                queue,
                addToQueue,
                removeFromQueue,
                clearQueue,
                prescription,
                setPrescription,
                presentation,
                setPresentation,
                dispensation,
                setDispensation,
                acknowledgement,
                setAcknowledgement,
                isSubmitting,
                setIsSubmitting,
                isProcessing
            }}
        >
            {children}
        </BroadcastContext.Provider>
    );
};

export default BroadcastContext;