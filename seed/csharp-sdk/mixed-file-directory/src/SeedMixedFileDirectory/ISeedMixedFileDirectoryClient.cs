namespace SeedMixedFileDirectory;

public partial interface ISeedMixedFileDirectoryClient
{
    public OrganizationClient Organization { get; }
    public UserClient User { get; }
}
