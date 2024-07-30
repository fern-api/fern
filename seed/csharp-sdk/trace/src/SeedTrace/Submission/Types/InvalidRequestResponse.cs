using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record InvalidRequestResponse
{
    [JsonPropertyName("request")]
    public required object Request { get; }

    [JsonPropertyName("cause")]
    public required object Cause { get; }
}
