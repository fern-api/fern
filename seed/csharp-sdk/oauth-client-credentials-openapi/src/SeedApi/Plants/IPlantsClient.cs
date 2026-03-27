namespace SeedApi;

public partial interface IPlantsClient
{
    WithRawResponseTask<IEnumerable<Plant>> ListAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Plant> GetAsync(
        GetPlantsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
