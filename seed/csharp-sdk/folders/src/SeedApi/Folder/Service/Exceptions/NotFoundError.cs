using SeedApi;

namespace SeedApi.Folder;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
public class NotFoundError(string body) : SeedApiApiException("NotFoundError", 404, body)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new string Body => body;
}
