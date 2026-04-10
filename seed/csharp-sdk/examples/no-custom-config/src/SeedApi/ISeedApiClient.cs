namespace SeedApi;

public partial interface ISeedApiClient
{
    public IClient _ { get; }
    public IFileNotificationServiceClient FileNotificationService { get; }
    public IFileServiceClient FileService { get; }
    public IHealthServiceClient HealthService { get; }
    public IServiceClient Service { get; }
}
