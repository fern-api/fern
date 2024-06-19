using System.Text.Json.Serialization;

#nullable enable

namespace SeedExhaustive;

public class BadObjectRequestInfo
{
    [JsonPropertyName("message")]
    public string Message { get; init; }
}
