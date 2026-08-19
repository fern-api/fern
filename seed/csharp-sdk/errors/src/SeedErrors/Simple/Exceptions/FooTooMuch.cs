namespace SeedErrors;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[Serializable]
public class FooTooMuch(ErrorBody body, SeedErrors.RawResponse? rawResponse = null)
    : SeedErrorsApiException("FooTooMuch", 429, body, rawResponse: rawResponse)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new ErrorBody Body => body;
}
