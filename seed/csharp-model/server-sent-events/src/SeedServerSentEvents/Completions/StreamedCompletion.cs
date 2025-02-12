using System.Text.Json.Serialization;
using SeedServerSentEvents.Core;

namespace SeedServerSentEvents;

public record StreamedCompletion
{
    [JsonPropertyName("delta")]
    public required string Delta { get; set; }

    [JsonPropertyName("tokens")]
    public int? Tokens { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
