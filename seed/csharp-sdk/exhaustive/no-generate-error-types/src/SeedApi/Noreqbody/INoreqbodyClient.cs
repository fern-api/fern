namespace SeedApi;

public partial interface INoreqbodyClient
{
    WithRawResponseTask<TypesObjectWithOptionalField> GetwithnorequestbodyAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<string> PostwithnorequestbodyAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
