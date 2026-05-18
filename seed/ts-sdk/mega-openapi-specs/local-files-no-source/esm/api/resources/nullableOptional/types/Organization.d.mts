export interface Organization {
    id: string;
    name: string;
    domain: string | null;
    employeeCount?: (number | null) | undefined;
}
