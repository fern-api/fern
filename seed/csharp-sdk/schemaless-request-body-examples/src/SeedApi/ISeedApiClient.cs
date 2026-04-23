namespace SeedApi;

public partial interface ISeedApiClient
{
    /// <summary>
    /// Creates a plant with example JSON but no request body schema.
    /// </summary>
    WithRawResponseTask<CreatePlantResponse> CreatePlantAsync(
        object request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Updates a plant with example JSON but no request body schema.
    /// </summary>
    WithRawResponseTask<UpdatePlantResponse> UpdatePlantAsync(
        UpdatePlantRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// A control endpoint that has both schema and example defined.
    /// </summary>
    WithRawResponseTask<CreatePlantWithSchemaResponse> CreatePlantWithSchemaAsync(
        CreatePlantWithSchemaRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
