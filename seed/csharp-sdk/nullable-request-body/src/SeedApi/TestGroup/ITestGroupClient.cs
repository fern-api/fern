namespace SeedApi;

public partial interface ITestGroupClient
{
    /// <summary>
    /// Post a nullable request body
    /// </summary>
    WithRawResponseTask<object> TestMethodNameAsync(
        TestMethodNameTestGroupRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
