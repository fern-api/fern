namespace SeedApi;

public partial interface ISeedApiClient
{
    public IClientsClient Clients { get; }
}
