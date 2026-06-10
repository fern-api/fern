namespace SeedStreaming;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
public class SeedStreamingApiException(
    string message,
    int statusCode,
    object body,
    Exception? innerException = null,
    SeedStreaming.RawResponse? rawResponse = null
) : SeedStreamingException(message, innerException)
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
    public SeedStreaming.RawResponse? RawResponse => rawResponse;

    public override string ToString()
    {
        var sb = new System.Text.StringBuilder();
        sb.Append(GetType().FullName);
        sb.Append($": {Message}");
        sb.Append($" (Status Code: {StatusCode})");
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
