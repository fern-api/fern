using SeedExhaustive;

namespace SeedExhaustive.GeneralErrors;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[System.Serializable]
public class BadRequestBody(SeedExhaustive.GeneralErrors.BadObjectRequestInfo body)
    : SeedExhaustive.SeedExhaustiveApiException("BadRequestBody", 400, body)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new SeedExhaustive.GeneralErrors.BadObjectRequestInfo Body => body;
}
