using System.Text.Json.Serialization;

#nullable enable

namespace SeedAudiences.FolderD;

public record Response
{
    [JsonPropertyName("foo")]
    public required string Foo { get; set; }
}
