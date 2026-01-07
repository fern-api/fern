using SeedExhaustive.Types;

namespace SeedExhaustive;

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
