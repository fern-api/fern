export function getOrganizationNameValidationError(organizationName: string): string | undefined {
    if (organizationName.length === 0) {
        return "Organization name cannot be empty";
    }
    return undefined;
}
