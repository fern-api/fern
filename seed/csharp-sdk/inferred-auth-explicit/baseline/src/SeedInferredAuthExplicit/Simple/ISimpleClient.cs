namespace SeedInferredAuthExplicit;

public partial interface ISimpleClient
{
    Task GetSomethingAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
