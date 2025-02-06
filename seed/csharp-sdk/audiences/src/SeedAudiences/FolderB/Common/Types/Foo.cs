using System.Text.Json.Serialization;
using SeedAudiences.FolderC;
using SeedAudiences.Core;

    namespace SeedAudiences.FolderB;

public record Foo
{
    [JsonPropertyName("foo")]
    public FolderCFoo? Foo_ { get; set; }
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
