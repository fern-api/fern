using System.Text.Json.Serialization;

#nullable enable

namespace SeedCrossPackageTypeNames.FolderB;

public record Foo
{
    [JsonPropertyName("foo")]
    public FolderC.Foo? Foo_ { get; set; }
}
