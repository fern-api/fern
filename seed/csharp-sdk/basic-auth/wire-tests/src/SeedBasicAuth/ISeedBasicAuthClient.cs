namespace SeedBasicAuth;

public partial interface ISeedBasicAuthClient
{
    public IBasicAuthClient BasicAuth { get; }
}
