using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[Serializable]
public class NestedObjectWithOptionalFieldError(NestedObjectWithOptionalField body)
    : SeedExhaustiveApiException("NestedObjectWithOptionalFieldError", 400, body)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new NestedObjectWithOptionalField Body => body;
}
