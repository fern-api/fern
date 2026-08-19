using SeedExhaustive;

namespace SeedExhaustive.Types.Object;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[Serializable]
public class NestedObjectWithRequiredFieldError(
    NestedObjectWithRequiredField body,
    SeedExhaustive.RawResponse? rawResponse = null
)
    : SeedExhaustiveApiException(
        "NestedObjectWithRequiredFieldError",
        400,
        body,
        rawResponse: rawResponse
    )
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new NestedObjectWithRequiredField Body => body;
}
