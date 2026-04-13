namespace SeedApi;

public partial interface IClient
{
    /// <summary>
    /// Get timezone information with + offset
    /// </summary>
    WithRawResponseTask<TimeZoneModel> GetTimeZoneAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
