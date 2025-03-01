using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record Conversation
{
    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
