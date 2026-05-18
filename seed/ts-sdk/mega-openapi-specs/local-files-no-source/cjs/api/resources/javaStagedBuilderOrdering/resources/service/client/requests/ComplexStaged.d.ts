/**
 * @example
 *     {
 *         fieldA: "a",
 *         fieldB: 1,
 *         fieldC: true,
 *         fieldD: "d",
 *         fieldE: 1.5,
 *         optionalX: "x",
 *         optionalY: 2,
 *         optionalZ: false
 *     }
 */
export interface ComplexStaged {
    fieldA: string;
    fieldB: number;
    fieldC: boolean;
    fieldD: string;
    fieldE: number;
    optionalX?: string | null;
    optionalY?: number | null;
    optionalZ?: boolean | null;
}
