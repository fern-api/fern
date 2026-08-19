namespace SeedApi;

public partial interface ISeedApiClient
{
    public IContactsClient Contacts { get; }
}
