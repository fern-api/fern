using System.Text.Json.Serialization;
using SeedAudiences.FolderC;

#nullable enable

namespace SeedAudiences.FolderB;

public record Foo
{
    [JsonPropertyName("foo")]
    public FolderCFoo? Foo_ { get; set; }
}
