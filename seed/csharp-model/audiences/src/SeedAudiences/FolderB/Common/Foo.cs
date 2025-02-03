using System.Text.Json.Serialization;
using SeedAudiences.Core;
using SeedAudiences.FolderC;

namespace SeedAudiences.FolderB;

public record Foo
{
    [JsonPropertyName("foo")]
    public FolderCFoo? Foo_ { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
