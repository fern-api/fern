using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record LangServerResponse
{
    [JsonPropertyName("response")]
    public required object Response { get; set; }
}
