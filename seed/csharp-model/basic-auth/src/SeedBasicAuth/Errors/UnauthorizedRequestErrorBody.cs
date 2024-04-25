using System.Text.Json.Serialization;

namespace SeedBasicAuth;

public class UnauthorizedRequestErrorBody
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
