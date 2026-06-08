namespace SeedPathParameters;

public partial interface ISeedPathParametersClient
{
    public IBytesClient Bytes { get; }
    public IHeadersClient Headers { get; }
    public IOrganizationsClient Organizations { get; }
    public IUserClient User { get; }
}
