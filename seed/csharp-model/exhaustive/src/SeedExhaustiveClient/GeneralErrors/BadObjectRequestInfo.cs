using System.Text.Json.Serialization;

namespace SeedExhaustiveClient;

public class BadObjectRequestInfo
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
