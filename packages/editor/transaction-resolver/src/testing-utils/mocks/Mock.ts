import { immerable } from "immer";

export abstract class Mock {
    [immerable] = true;
}
