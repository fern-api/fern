using System.Text.Json.Serialization;

#nullable enable

namespace SeedCustomAuth;

public class UnauthorizedRequestErrorBody
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
