using SeedApi.Core;

namespace SeedApi;

public partial interface IInlinedrequestsClient
{
    /// <summary>
    /// POST with custom object in request body, response is an object
    /// </summary>
    WithRawResponseTask<TypesObjectWithOptionalField> PostwithobjectbodyandresponseAsync(
        InlinedRequestsPostWithObjectBodyandResponseRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
