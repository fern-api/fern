namespace SeedBasicAuthEnvironmentVariables;

/// <summary>
/// This exception type will be thrown for any non-2XX API responses.
/// </summary>
[Serializable]
public class BadRequest(
    object body,
    SeedBasicAuthEnvironmentVariables.RawResponse? rawResponse = null
)
    : SeedBasicAuthEnvironmentVariablesApiException(
        "BadRequest",
        400,
        body,
        rawResponse: rawResponse
    );
