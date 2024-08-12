using System.Text.Json.Serialization;

#nullable enable

namespace SeedAudiences.FolderB;

public record Foo
{
    [JsonPropertyName("foo")]
    public FolderC.Foo? Foo_ { get; set; }
}
