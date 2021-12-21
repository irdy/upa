
/*
   \\
    \\_
     (')
    / )=
  o( )_
*/

import { BehaviorSubject } from "rxjs";

/**
 * Dirty hack
 * Не получилось адекватно использовать абстрактный дженерик класс со статическим методом
 * @see https://stackoverflow.com/questions/52518125/workaround-for-accessing-class-type-arguments-in-static-method-in-typescript
 * @constructor
 */
export function getStore<S>() {
  abstract class Store {
    protected static _instance: any;

    // can't use protected constructor with InstanceType<T> :/
    // @ts-ignore
    constructor() {
      const _constructor = this.constructor as typeof Store;
      if (_constructor.name === "Store") {
        throw new Error("Store Instance must be created only with sub Classes");
      }

      if (_constructor._instance) {
        throw new Error("Store already was created. Use `getInstance` static method instead of constructor");
      }

      _constructor._instance = this;
    }

    /**
     * Check subject exist on store
     * If exists: return this subject
     * else: create new, save as prop on store, and return it
     * @param subjectName
     * @param target
     */
    private static _getSubject<T>(subjectName: S, target: any): BehaviorSubject<T | void> {
      const subjectPropName = subjectName + 'Subject';
      if (!target[subjectPropName]) {
        target[subjectPropName] = new BehaviorSubject<T | void>(undefined);
      }

      return target[subjectPropName];
    }


    /**
     * Decorator
     * Emit data returned from decorated function to subject.
     * if Subject has no exist yet will be created new and saved as property of Store instance.
     * Store {
     *   [subjectName + "Subject"] = new BehaviourSubject<T>();
     * }
     * @param subjectName
     */
    static withSubject<T>(subjectName: S) {
      type Sync = (...args: never[]) => T;
      type Async = (...args: never[]) => Promise<T>;

      type DecoratedFunction = Sync | Async;

      const isAsync = (myFunction: DecoratedFunction): myFunction is Async =>
        myFunction.constructor.name === "AsyncFunction";

      const isSync = (myFunction: DecoratedFunction): myFunction is Sync =>
        myFunction.constructor.name !== "AsyncFunction";

      return function (
        target: any,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<Sync> | TypedPropertyDescriptor<Async>
      ) {
        const method = descriptor.value;
        if (method === undefined) {
          throw Error("Fatal error");
        }

        const subject = Store._getSubject<T>(subjectName, target);

        function getHandler(method: DecoratedFunction): DecoratedFunction {
          if (isAsync(method)) {
            return async function Async(...args: never[]): Promise<T> {
              const data = await method(...args);
              subject.next(data);
              return data;
            }
          }

          if (isSync(method)) {
            return function Sync(...args: never[]): T {
              const data = method(...args);
              subject.next(data);
              return data;
            }
          }

          throw Error("Cannot determine a function");
        }

        descriptor.value = getHandler(method);
      }
    }

    getSubject<T>(subjectName: S): BehaviorSubject<T> {
      const subjectPropName = subjectName + 'Subject';
      const instance = this as any;
      const subject = instance[subjectPropName];

      if (!subject) {
        throw Error("Subject with name " + subjectName + "Subject does not exist on Store");
      }
      return subject;
    }

    static getInstance<T extends typeof Store>(this: T): InstanceType<T> {
      if (!this._instance) {
        this._instance = new (this as any)();
      }

      return this._instance as InstanceType<T>;
    }
  }

  return Store;
}

