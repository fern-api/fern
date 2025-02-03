using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record UsernameCursor
{
    [JsonPropertyName("cursor")]
    public required UsernamePage Cursor { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
