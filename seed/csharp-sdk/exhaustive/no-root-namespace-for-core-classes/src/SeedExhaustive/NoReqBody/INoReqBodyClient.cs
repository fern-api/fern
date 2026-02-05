using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace SeedExhaustive;

public partial interface INoReqBodyClient
{
    WithRawResponseTask<ObjectWithOptionalField> GetWithNoRequestBodyAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> PostWithNoRequestBodyAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
