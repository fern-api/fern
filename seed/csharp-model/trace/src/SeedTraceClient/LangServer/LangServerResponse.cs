using System.Text.Json.Serialization

namespace SeedTraceClient

public class LangServerResponse
{
    [JsonPropertyName("response")]
    public object Response { get; init; }
}
