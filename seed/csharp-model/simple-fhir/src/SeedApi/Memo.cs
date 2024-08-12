using System.Text.Json.Serialization;

#nullable enable

namespace SeedApi;

public record Memo
{
    [JsonPropertyName("description")]
    public required string Description { get; set; }

    [JsonPropertyName("account")]
    public Account? Account { get; set; }
}
