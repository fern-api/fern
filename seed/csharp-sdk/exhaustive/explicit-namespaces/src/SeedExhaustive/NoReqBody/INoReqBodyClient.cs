using SeedExhaustive;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.NoReqBody;

public partial interface INoReqBodyClient
{
    Task<ObjectWithOptionalField> GetWithNoRequestBodyAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<string> PostWithNoRequestBodyAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
