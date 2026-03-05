namespace SeedApi;

public partial interface ISeedApiClient
{
    /// <summary>
    /// Creates an order for a plant.
    /// </summary>
    WithRawResponseTask<PlantOrder> CreatePlantOrderAsync(
        CreatePlantOrderRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
