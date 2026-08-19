using OneOf;
using SeedExamples.File_;
using SeedExamples.Health;

namespace SeedExamples;

public partial interface ISeedExamplesClient
{
    public IFileClient File { get; }
    public IHealthClient Health { get; }
    public IServiceClient Service { get; }
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
