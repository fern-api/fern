namespace SeedApi;

public partial interface ISeedApiClient
{
    public IPaymentClient Payment { get; }
}
