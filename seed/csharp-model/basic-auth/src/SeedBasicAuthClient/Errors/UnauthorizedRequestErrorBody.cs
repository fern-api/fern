using System.Text.Json.Serialization;

namespace SeedBasicAuthClient;

public class UnauthorizedRequestErrorBody
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
