using System.Text.Json.Serialization;

#nullable enable

namespace SeedBasicAuth;

public class UnauthorizedRequestErrorBody
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
