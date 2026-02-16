using System.Text.Json.Serialization;
using SeedServerSentEvents.Core;

namespace SeedServerSentEvents;

[Serializable]
public record StreamEventsRequest
{
    [JsonPropertyName("query")]
    public required string Query { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
