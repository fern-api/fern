using System.Text.Json.Serialization;

namespace SeedTrace;

public class LangServerRequest
{
    [JsonPropertyName("request")]
    public object Request { get; init; }
}
