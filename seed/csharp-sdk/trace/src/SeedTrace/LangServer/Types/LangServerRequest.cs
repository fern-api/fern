using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class LangServerRequest
{
    [JsonPropertyName("request")]
    public object Request { get; init; }
}
