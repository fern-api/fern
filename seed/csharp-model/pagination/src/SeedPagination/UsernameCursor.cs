using System.Text.Json.Serialization;

#nullable enable

namespace SeedPagination;

public record UsernameCursor
{
    [JsonPropertyName("cursor")]
    public required UsernamePage Cursor { get; set; }
}
