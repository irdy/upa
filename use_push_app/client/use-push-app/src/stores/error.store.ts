import {
  asyncScheduler,
  map, observeOn,
  scan,
  Subject,
} from "rxjs";
import { Store } from "./store";

let counter = 0; // Date?

export interface IError {
  id: number,
  error: IErrorData
}

export interface IErrorData {
  message: string | null,
  data?: any
}

export class ErrorStore extends Store {
  errorsSubject = new Subject<IErrorData>()
  errorsObservable = this.errorsSubject
    .pipe(
      // get only last 3 errors
      // scan((acc: string[], value: string[]) => acc.concat(value).slice(-3), []),
      map((err: IErrorData) => {
        return {
          id: counter++,
          error: err
        }
      }),
      observeOn(asyncScheduler)
    )
}