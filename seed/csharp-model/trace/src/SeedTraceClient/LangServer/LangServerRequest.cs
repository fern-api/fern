using System.Text.Json.Serialization;

namespace SeedTraceClient;

public class LangServerRequest
{
    [JsonPropertyName("request")]
    public object Request { get; init; }
}
