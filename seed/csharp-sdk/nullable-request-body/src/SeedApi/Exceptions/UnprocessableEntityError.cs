namespace SeedApi;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[Serializable]
public class UnprocessableEntityError(PlainObject body, SeedApi.RawResponse? rawResponse = null)
    : SeedApiApiException("UnprocessableEntityError", 422, body, rawResponse: rawResponse)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new PlainObject Body => body;
}
