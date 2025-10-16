export function getOrganizationNameValidationError(organizationName: string): string | undefined {
    if (organizationName.length === 0) {
        return "Organization name cannot be empty";
    }

    const validOrganizationNamePattern = /^[a-z0-9-]+$/;
    if (!validOrganizationNamePattern.test(organizationName)) {
        return "Organization name must contain only lowercase letters, numbers, and hyphens";
    }

    return undefined;
}
