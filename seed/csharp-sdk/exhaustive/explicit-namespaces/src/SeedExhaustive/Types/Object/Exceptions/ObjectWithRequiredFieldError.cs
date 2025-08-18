using SeedExhaustive;

namespace SeedExhaustive.Types.Object;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[System.Serializable]
public class ObjectWithRequiredFieldError(SeedExhaustive.Types.Object.ObjectWithRequiredField body)
    : SeedExhaustive.SeedExhaustiveApiException("ObjectWithRequiredFieldError", 400, body)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new SeedExhaustive.Types.Object.ObjectWithRequiredField Body => body;
}
