namespace SeedMixedFileDirectory;

public partial interface ISeedMixedFileDirectoryClient
{
    public IOrganizationClient Organization { get; }
    public IUserClient User { get; }
}
