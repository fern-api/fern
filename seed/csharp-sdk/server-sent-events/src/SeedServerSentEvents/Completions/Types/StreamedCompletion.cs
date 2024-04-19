using System.Text.Json.Serialization;

namespace SeedServerSentEvents;

public class StreamedCompletion
{
    [JsonPropertyName("delta")]
    public string Delta { get; init; }

    [JsonPropertyName("tokens")]
    public List<int?> Tokens { get; init; }
}
