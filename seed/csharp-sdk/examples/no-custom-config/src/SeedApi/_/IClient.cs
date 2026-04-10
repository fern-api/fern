using OneOf;

namespace SeedApi;

public partial interface IClient
{
    WithRawResponseTask<string> EchoAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Identifier> CreateTypeAsync(
        OneOf<BasicType, ComplexType> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
