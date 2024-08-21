using System.Text.Json.Serialization;

#nullable enable

namespace SeedCrossPackageTypeNames.FolderA;

public record Response
{
    [JsonPropertyName("foo")]
    public FolderB.Foo? Foo { get; set; }
}
