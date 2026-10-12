namespace SeedApi;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[Serializable]
public class InternalServerError(PlaidError body, SeedApi.RawResponse? rawResponse = null)
    : SeedApiApiException("InternalServerError", 500, body, rawResponse: rawResponse)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new PlaidError Body => body;
}
