using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class LangServerResponse
{
    [JsonPropertyName("response")]
    public object Response { get; init; }
}
