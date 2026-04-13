using OneOf;

namespace SeedApi;

public partial interface ISeedApiClient
{
    public IFileNotificationServiceClient FileNotificationService { get; }
    public IFileServiceClient FileService { get; }
    public IHealthServiceClient HealthService { get; }
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
