namespace SeedApi;

public partial interface INoReqBodyClient
{
    WithRawResponseTask<TypesObjectWithOptionalField> GetWithNoRequestBodyAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> PostWithNoRequestBodyAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
