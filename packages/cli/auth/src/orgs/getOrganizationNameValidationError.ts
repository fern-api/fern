export function getOrganizationNameValidationError(organizationName: string): string | undefined {
    const regex = new RegExp("^[a-z][a-z0-9-]*$");
    if (organizationName.length === 0) {
        return "Organization name cannot be empty.\nUse --organization flag to specify organization name.\nUse command: fern init --organization <org name>";
    }
    else if (!regex.test(organizationName)) {
        return "Organization name must start with a Small Letter & contain only Lowercase Letters, Numbers, and Dashes.\nUse --organization flag to specify organization name.\nUse command: fern init --organization <org name>";
    }

    return undefined;
}
