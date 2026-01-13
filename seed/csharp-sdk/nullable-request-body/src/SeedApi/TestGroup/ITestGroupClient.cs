namespace SeedApi;

public partial interface ITestGroupClient
{
    /// <summary>
    /// Post a nullable request body
    /// </summary>
    Task<object> TestMethodNameAsync(
        TestMethodNameTestGroupRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
