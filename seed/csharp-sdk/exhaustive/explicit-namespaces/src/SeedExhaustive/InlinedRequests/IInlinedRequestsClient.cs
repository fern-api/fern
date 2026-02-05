using SeedExhaustive;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.InlinedRequests;

public partial interface IInlinedRequestsClient
{
    /// <summary>
    /// POST with custom object in request body, response is an object
    /// </summary>
    WithRawResponseTask<ObjectWithOptionalField> PostWithObjectBodyandResponseAsync(
        PostWithObjectBody request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
