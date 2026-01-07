namespace SeedApi;

public partial interface ISeedApiClient
{
    public DataserviceClient Dataservice { get; }
}
