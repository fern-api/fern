namespace SeedApi;

public partial interface ISeedApiClient
{
    public IComplexClient Complex { get; }
    public IInlineUsersInlineUsersClient InlineUsersInlineUsers { get; }
    public IUsersClient Users { get; }
}
