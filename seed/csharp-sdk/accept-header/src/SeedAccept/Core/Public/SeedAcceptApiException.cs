using global::System.Text.Json;

namespace SeedAccept;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
public class SeedAcceptApiException(
    string message,
    int statusCode,
    object body,
    Exception? innerException = null,
    SeedAccept.RawResponse? rawResponse = null
) : SeedAcceptException(message, innerException)
{
    /// <summary>
    /// The error code of the response that triggered the exception.
    /// </summary>
    public int StatusCode => statusCode;

    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public object Body => body;

    /// <summary>
    /// The raw HTTP response (status code, URL, headers) that triggered the exception, if available.
    /// </summary>
    public SeedAccept.RawResponse? RawResponse => rawResponse;

    public override string ToString()
    {
        var sb = new System.Text.StringBuilder();
        sb.Append(GetType().FullName);
        sb.Append($": {Message}");
        sb.Append($" (Status Code: {StatusCode})");
        if (Body != null)
        {
            sb.Append($"\nBody: {JsonSerializer.Serialize(Body)}");
        }
        if (InnerException != null)
        {
            sb.Append($"\n ---> {InnerException}");
            sb.Append("\n --- End of inner exception stack trace ---");
        }
        if (StackTrace != null)
        {
            sb.Append($"\n{StackTrace}");
        }
        return sb.ToString();
    }
}
