using global::System.Text.Json.Serialization;
using SeedServerSentEventsResumable.Core;

namespace SeedServerSentEventsResumable;

[Serializable]
public record StreamCompletionRequest
{
    [JsonPropertyName("query")]
    public required string Query { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
