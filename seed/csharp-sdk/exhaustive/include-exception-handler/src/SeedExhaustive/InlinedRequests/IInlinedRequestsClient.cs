using SeedExhaustive.Types;

namespace SeedExhaustive;

public partial interface IInlinedRequestsClient
{
    /// <summary>
    /// POST with custom object in request body, response is an object
    /// </summary>
    Task<ObjectWithOptionalField> PostWithObjectBodyandResponseAsync(
        PostWithObjectBody request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
