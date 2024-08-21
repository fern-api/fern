using System.Text.Json.Serialization;

#nullable enable

namespace SeedCrossPackageTypeNames.FolderD;

public record Response
{
    [JsonPropertyName("foo")]
    public FolderB.Foo? Foo { get; set; }
}
