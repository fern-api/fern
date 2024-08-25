using System.Text.Json.Serialization;
using SeedCrossPackageTypeNames.Core;

#nullable enable

namespace SeedCrossPackageTypeNames.FolderD;

public record Response
{
    [JsonPropertyName("foo")]
    public FolderB.Foo? Foo { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
