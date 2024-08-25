using System.Text.Json.Serialization;

#nullable enable

namespace SeedExhaustive;

public record BadObjectRequestInfo
{
    [JsonPropertyName("message")]
    public required string Message { get; }
}
