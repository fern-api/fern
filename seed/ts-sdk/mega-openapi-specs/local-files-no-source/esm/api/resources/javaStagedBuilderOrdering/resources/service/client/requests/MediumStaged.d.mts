/**
 * @example
 *     {
 *         alpha: "alpha",
 *         beta: 1,
 *         gamma: "gamma",
 *         delta: true,
 *         optional: "optional"
 *     }
 */
export interface MediumStaged {
    alpha: string;
    beta: number;
    gamma: string;
    delta: boolean;
    optional?: string | null;
}
