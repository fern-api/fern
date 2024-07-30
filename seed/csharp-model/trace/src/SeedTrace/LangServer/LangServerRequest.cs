using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record LangServerRequest
{
    [JsonPropertyName("request")]
    public required object Request { get; set; }
}
