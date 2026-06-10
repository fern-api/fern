using SeedExhaustive;

namespace SeedExhaustive.Types;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[Serializable]
public class ObjectWithOptionalFieldError(
    ObjectWithOptionalField body,
    SeedExhaustive.RawResponse? rawResponse = null
) : SeedExhaustiveApiException("ObjectWithOptionalFieldError", 400, body, rawResponse: rawResponse)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new ObjectWithOptionalField Body => body;
}
