using SeedExhaustive;

namespace SeedExhaustive.Types.Object;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[System.Serializable]
public class ObjectWithOptionalFieldError(SeedExhaustive.Types.Object.ObjectWithOptionalField body)
    : SeedExhaustive.SeedExhaustiveApiException("ObjectWithOptionalFieldError", 400, body)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new SeedExhaustive.Types.Object.ObjectWithOptionalField Body => body;
}
