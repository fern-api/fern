using System.Text.Json.Serialization;

#nullable enable

namespace SeedPagination;

public record WithCursor
{
    [JsonPropertyName("cursor")]
    public string? Cursor { get; set; }
}
