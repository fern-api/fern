namespace SeedCsharpXmlEntities;

public partial interface ISeedCsharpXmlEntitiesClient
{
    /// <summary>
    /// Get timezone information with + offset
    /// </summary>
    WithRawResponseTask<TimeZoneModel> GetTimeZoneAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
