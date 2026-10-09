namespace SeedApi;

public partial interface ISeedApiClient
{
    /// <summary>
    /// Returns a paginated list of all plants currently in the store inventory.
    /// </summary>
    WithRawResponseTask<IEnumerable<Plant>> ListPlantsAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Retrieve details about a specific plant by its unique identifier.
    /// </summary>
    WithRawResponseTask<Plant> GetPlantAsync(
        GetPlantRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
