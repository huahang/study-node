import * as pull from "pull-stream";
import { SourceCallback } from "pull-stream";

export function Delay(timeout: number): pull.Through<any, any> {
  return function (read: pull.Source<any>): pull.Source<any> {
    return function (abort: pull.Abort, callback: SourceCallback<any>) {
      read(abort, function (abort: pull.Abort, a: any) {
        setTimeout(function () {
          callback(abort, a);
        }, timeout);
      });
    };
  };
}
