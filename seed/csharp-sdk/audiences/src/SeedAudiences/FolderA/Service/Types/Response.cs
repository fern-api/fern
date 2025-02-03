using System.Text.Json.Serialization;
using SeedAudiences.Core;
using SeedAudiences.FolderB;

namespace SeedAudiences.FolderA;

public record Response
{
    [JsonPropertyName("foo")]
    public Foo? Foo { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
