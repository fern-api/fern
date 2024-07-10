using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record InvalidRequestResponse
{
    [JsonPropertyName("request")]
    public required object Request { get; init; }

    [JsonPropertyName("cause")]
    public required object Cause { get; init; }
}
