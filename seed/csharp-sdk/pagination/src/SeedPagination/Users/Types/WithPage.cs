using System.Text.Json.Serialization;

#nullable enable

namespace SeedPagination;

public record WithPage
{
    [JsonPropertyName("page")]
    public int? Page { get; set; }
}
