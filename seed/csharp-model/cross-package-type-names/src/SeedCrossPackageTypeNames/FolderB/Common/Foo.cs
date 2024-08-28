using System.Text.Json.Serialization;
using SeedCrossPackageTypeNames.Core;

#nullable enable

namespace SeedCrossPackageTypeNames.FolderB;

public record Foo
{
    [JsonPropertyName("foo")]
    public FolderC.Foo? Foo_ { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
