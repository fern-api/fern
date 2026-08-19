namespace SeedBasicAuth;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[Serializable]
public class BadRequest(object body, SeedBasicAuth.RawResponse? rawResponse = null)
    : SeedBasicAuthApiException("BadRequest", 400, body, rawResponse: rawResponse);
