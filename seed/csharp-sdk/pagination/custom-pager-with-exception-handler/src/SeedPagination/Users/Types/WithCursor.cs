using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record WithCursor
{
    [JsonPropertyName("cursor")]
    public string? Cursor { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
