using System.Text.Json.Serialization;
using SeedServerSentEvents.Core;

namespace SeedServerSentEvents;

public record StreamCompletionRequest
{
    [JsonPropertyName("query")]
    public required string Query { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
