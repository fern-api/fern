using SeedExhaustive;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.NoReqBody;

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
