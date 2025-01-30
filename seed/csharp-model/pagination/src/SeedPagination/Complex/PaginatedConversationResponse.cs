using System.Text.Json.Serialization;
using SeedPagination.Core;

#nullable enable

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
    public required string Type { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
