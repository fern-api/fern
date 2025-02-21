export const DateTypeOption = {
    USE_DATE_TIME: "use-date-time" as const,
    USE_DATE_ONLY_ON_NET6_PLUS: "use-date-only-on-net6+" as const,
    USE_DATE_ONLY_PORTABLE: "use-date-only-portable" as const
};
export type DateTypeOption = (typeof DateTypeOption)[keyof typeof DateTypeOption];
