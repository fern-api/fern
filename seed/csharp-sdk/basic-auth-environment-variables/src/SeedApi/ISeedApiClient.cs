namespace SeedApi;

public partial interface ISeedApiClient
{
    public IBasicauthClient Basicauth { get; }
}
