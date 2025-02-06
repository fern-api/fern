using System.Text.Json.Serialization;
using SeedAudiences.Core;

namespace SeedAudiences.FolderD;

public record Response
{
    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
