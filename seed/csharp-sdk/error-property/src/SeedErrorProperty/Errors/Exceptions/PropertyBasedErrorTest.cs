namespace SeedErrorProperty;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[Serializable]
public class PropertyBasedErrorTest(
    PropertyBasedErrorTestBody body,
    SeedErrorProperty.RawResponse? rawResponse = null
) : SeedErrorPropertyApiException("PropertyBasedErrorTest", 400, body, rawResponse: rawResponse)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new PropertyBasedErrorTestBody Body => body;
}
