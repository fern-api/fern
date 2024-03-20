using System.Text.Json.Serialization;

namespace SeedCustomAuthClient;

public class UnauthorizedRequestErrorBody
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
