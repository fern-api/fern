namespace SeedApi;

public partial interface ISeedApiClient
{
    public IConversationsClient Conversations { get; }
    public IUsersClient Users { get; }
}
