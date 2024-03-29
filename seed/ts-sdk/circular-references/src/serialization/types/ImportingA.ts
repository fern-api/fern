/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "..";
import * as SeedApi from "../../api";
import * as core from "../../core";
import { A } from "../resources/a/types/A";

export const ImportingA: core.serialization.ObjectSchema<serializers.ImportingA.Raw, SeedApi.ImportingA> =
    core.serialization.object({
        a: A.optional(),
    });

export declare namespace ImportingA {
    interface Raw {
        a?: A.Raw | null;
    }
}
