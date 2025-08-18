using SeedExhaustive;

namespace SeedExhaustive.Types.Union;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[System.Serializable]
public class ErrorWithUnionBody(SeedExhaustive.Types.Union.Animal body)
    : SeedExhaustive.SeedExhaustiveApiException("ErrorWithUnionBody", 400, body)
{
    /// <summary>
    /// The body of the response that triggered the exception.
    /// </summary>
    public new SeedExhaustive.Types.Union.Animal Body => body;
}
