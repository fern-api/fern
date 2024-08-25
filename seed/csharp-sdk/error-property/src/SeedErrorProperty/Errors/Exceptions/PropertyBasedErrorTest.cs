namespace SeedErrorProperty;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
public class PropertyBasedErrorTest(PropertyBasedErrorTestBody body)
    : SeedErrorPropertyApiException("PropertyBasedErrorTest", 400, body)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new PropertyBasedErrorTestBody Body => body;
}
