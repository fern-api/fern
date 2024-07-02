using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class InvalidRequestResponse
{
    [JsonPropertyName("request")]
    public object Request { get; init; }

    [JsonPropertyName("cause")]
    public object Cause { get; init; }
}
