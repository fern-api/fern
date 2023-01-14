const ORG_NAME_REGEX = /^[a-z_-]+$/;

export function getOrganizationNameValidationError(organizationName: string): string | undefined {
    if (organizationName.length === 0) {
        return "Organization name cannot be empty";
    }
    if (!ORG_NAME_REGEX.test(organizationName)) {
        return "Organization name can only container lowercase letters, hypens, and underscores.";
    }
    return undefined;
}
