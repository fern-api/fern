/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as FernIr from "../../../index";

export interface ExampleUndiscriminatedUnionType {
    /**
     * The zero-based index of the undiscriminated union variant.
     * For the following undiscriminated union
     * ```
     * MyUnion:
     *   discriminated: false
     *   union:
     *     - string
     *     - integer
     * ```
     * a string example would have an index 0 and an integer example
     * would have an index 1.
     */
    index: number;
    singleUnionType: FernIr.ExampleTypeReference;
}
