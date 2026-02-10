namespace SeedApi;

public partial interface ISeedApiClient
{
    public IDataserviceClient Dataservice { get; }
}
