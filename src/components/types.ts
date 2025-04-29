import { Transaction } from "@bsv/sdk";

export interface DataEntry {
  paciente?: {
    idPaciente: string;
    nombre: string;
    fechaNacimiento: string;
  };
  prescriptor?: {
    npiPrescriptor: string;
    nombre: string;
    clinica: string;
  };
  medicamento?: {
    nombreMedicamento: string;
    ndc: string;
    dosis: string;
    cantidad: number;
    recargas: number;
    instrucciones: string;
    fechaVencimiento: string;
  };
  farmacia?: {
    npiFarmacia: string;
    nombre: string;
    farmaceutico: string;
    fechaDispensacion: string;
  };
  timestamp: string;
  id: string;
  [key: string]: unknown;
}

export interface Token {
  data: DataEntry;
  txid: string;
  tx: Transaction;
}

export interface Submission {
  data: DataEntry;
  txid: string;
  step: string;
  arc: unknown;
}