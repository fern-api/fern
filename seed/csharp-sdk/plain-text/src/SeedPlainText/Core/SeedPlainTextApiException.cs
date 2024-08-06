using SeedPlainText.Core;

#nullable enable

namespace SeedPlainText.Core;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
public class SeedPlainTextApiException(string message, int statusCode, object body)
    : SeedPlainTextException(message)
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
        return $"SeedPlainTextApiException {{ message: {Message}, statusCode: {StatusCode}, body: {Body} }}";
    }
}
