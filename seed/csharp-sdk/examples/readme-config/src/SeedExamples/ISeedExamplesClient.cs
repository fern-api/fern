using OneOf;
using SeedExamples.File_;
using SeedExamples.Health;

namespace SeedExamples;

public partial interface ISeedExamplesClient
{
    public FileClient File { get; }
    public HealthClient Health { get; }
    public ServiceClient Service { get; }
    Task<string> EchoAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Identifier> CreateTypeAsync(
        OneOf<BasicType, ComplexType> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
