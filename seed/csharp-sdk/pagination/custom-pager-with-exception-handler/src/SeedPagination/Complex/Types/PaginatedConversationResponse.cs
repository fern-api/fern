using System.Text.Json;
using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record PaginatedConversationResponse
{
    [JsonPropertyName("conversations")]
    public IEnumerable<Conversation> Conversations { get; set; } = new List<Conversation>();

    [JsonPropertyName("pages")]
    public CursorPages? Pages { get; set; }

    [JsonPropertyName("total_count")]
    public required int TotalCount { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; set; } = "conversation.list";

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
