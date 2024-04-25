using System.Text.Json.Serialization;

namespace SeedTrace;

public class LangServerResponse
{
    [JsonPropertyName("response")]
    public object Response { get; init; }
}
