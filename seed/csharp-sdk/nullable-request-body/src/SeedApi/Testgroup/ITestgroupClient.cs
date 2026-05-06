namespace SeedApi;

public partial interface ITestgroupClient
{
    /// <summary>
    /// Post a nullable request body
    /// </summary>
    WithRawResponseTask<object> TestMethodNameAsync(
        TestGroupTestMethodNameRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
