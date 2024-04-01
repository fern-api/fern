using System.Text.Json.Serialization;

namespace SeedCustomAuth;

public class UnauthorizedRequestErrorBody
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
