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

type ErrorStoreSubjectNames = "error";

const Store = getStore<ErrorStoreSubjectNames>();

export class ErrorStore extends Store {
  static emitError(errorData: IErrorData) {
    ErrorStore.getInstance().getSubject("error").next(errorConverter(errorData))
  }
}

ErrorStore.initSubject<IError | void>("error");

