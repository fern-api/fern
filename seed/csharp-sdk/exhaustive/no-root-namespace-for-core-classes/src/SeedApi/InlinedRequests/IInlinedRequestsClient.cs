using SeedApi.Core;

namespace SeedApi;

public partial interface IInlinedRequestsClient
{
    /// <summary>
    /// POST with custom object in request body, response is an object
    /// </summary>
    WithRawResponseTask<TypesObjectWithOptionalField> PostWithObjectBodyandResponseAsync(
        PostWithObjectBodyandResponseInlinedRequestsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
