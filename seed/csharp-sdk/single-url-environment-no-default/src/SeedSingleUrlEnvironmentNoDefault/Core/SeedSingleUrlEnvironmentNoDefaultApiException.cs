using SeedSingleUrlEnvironmentNoDefault.Core;

#nullable enable

namespace SeedSingleUrlEnvironmentNoDefault.Core;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
public class SeedSingleUrlEnvironmentNoDefaultApiException(
    string message,
    int statusCode,
    object body
) : SeedSingleUrlEnvironmentNoDefaultException(message)
{
    /// <summary>
    /// The error code of the response that triggered the exception.
    /// </summary>
    public int StatusCode => statusCode;

    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public object Body => body;

    public override string ToString()
    {
        return $"SeedSingleUrlEnvironmentNoDefaultApiException {{ message: {Message}, statusCode: {StatusCode}, body: {Body} }}";
    }
}
