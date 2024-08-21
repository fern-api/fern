using System.Text.Json.Serialization;
using SeedAudiences.FolderB;

#nullable enable

namespace SeedAudiences.FolderA;

public record Response
{
    [JsonPropertyName("foo")]
    public Foo? Foo { get; set; }
}
