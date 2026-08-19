namespace SeedExamples.Health;

public partial interface IHealthClient
{
    public IServiceClient Service { get; }
}
