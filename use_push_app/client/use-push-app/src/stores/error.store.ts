import {
  Subject,
} from "rxjs";
import { getStore } from "./store";

let counter = 0; // Date?

export interface IError {
  id: number,
  error: IErrorData
}

export interface IErrorData {
  message: string | null,
  data?: any
}

function makeErrorConverter() {
  return function(err: IErrorData): IError {
    return {
      id: counter++,
      error: err
    }
  }
}

export const errorConverter = makeErrorConverter();

const Store = getStore();

export class ErrorStore extends Store {
  // todo?
  errorsSubject = new Subject<IError>();
}

