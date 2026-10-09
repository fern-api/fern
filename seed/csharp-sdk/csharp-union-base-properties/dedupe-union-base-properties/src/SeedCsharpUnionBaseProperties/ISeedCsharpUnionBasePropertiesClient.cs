namespace SeedCsharpUnionBaseProperties;

public partial interface ISeedCsharpUnionBasePropertiesClient
{
    WithRawResponseTask<Shape> CreateAsync(
        Shape request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
