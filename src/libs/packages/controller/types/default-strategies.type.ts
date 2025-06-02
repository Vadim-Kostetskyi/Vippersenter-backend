import { type ValueOf } from "~/libs/types";
import { type AuthStrategy } from "~/packages/auth/auth.js";

type DefaultStrategies =
  | ValueOf<typeof AuthStrategy>
  | ValueOf<typeof AuthStrategy>[]
  | undefined;

export { type DefaultStrategies };
