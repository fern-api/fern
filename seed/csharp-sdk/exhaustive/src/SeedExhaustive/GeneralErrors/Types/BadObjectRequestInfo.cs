using System.Text.Json.Serialization;

namespace SeedExhaustive;

public class BadObjectRequestInfo
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
