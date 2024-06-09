using System.Text.Json.Serialization;

#nullable enable

namespace SeedServerSentEvents;

public class StreamedCompletion
{
    [JsonPropertyName("delta")]
    public string Delta { get; init; }

    [JsonPropertyName("tokens")]
    public int? Tokens { get; init; }
}
