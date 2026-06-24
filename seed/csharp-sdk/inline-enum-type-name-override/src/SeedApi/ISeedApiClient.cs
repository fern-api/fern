namespace SeedApi;

public partial interface ISeedApiClient
{
    public IReportingClient Reporting { get; }
}
