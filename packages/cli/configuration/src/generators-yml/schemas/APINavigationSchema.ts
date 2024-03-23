import { z, ZodType } from "zod";

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface NavigationGroupSchema {
    [key: string]: NavigationItem | NavigationItem[];
}
export const NavigationGroupSchema: ZodType<NavigationGroupSchema> = z.lazy(() =>
    z.record(z.union([NavigationItem, z.array(NavigationItem)]))
);

export const NavigationItem = z.union([z.string(), NavigationGroupSchema]);
export type NavigationItem = z.infer<typeof NavigationItem>;

/**
 * NavigationSchema is a recursive schema that can be either a record,
 * a list of records, or a list of strings where the strings are endpoint ids
 * and the records are groups of endpoint ids for a subpackage.
 *
 * @example
 *   groupA: {}
 *   groupB:
 *      - methodA
 *      - methodB
 *      - groupC:
 *          - methodC
 */
export const APINavigationSchema = z.union([NavigationItem, z.array(NavigationGroupSchema)]);
export type APINavigationSchema = z.infer<typeof APINavigationSchema>;
