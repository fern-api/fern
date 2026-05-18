/** Type of insurance policy */
export declare const PolicyType: {
    readonly Health: "HEALTH";
    readonly Auto: "AUTO";
    readonly Home: "HOME";
    readonly Life: "LIFE";
};
export type PolicyType = (typeof PolicyType)[keyof typeof PolicyType];
