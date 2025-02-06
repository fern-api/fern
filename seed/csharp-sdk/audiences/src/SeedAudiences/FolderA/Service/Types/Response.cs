using System.Text.Json.Serialization;
using SeedAudiences.FolderB;
using SeedAudiences.Core;

    namespace SeedAudiences.FolderA;

public record Response
{
    [JsonPropertyName("foo")]
    public Foo? Foo { get; set; }
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
