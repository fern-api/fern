using System.Text.Json.Serialization;
using SeedAudiences.Core;

namespace SeedAudiences.FolderC;

public record FolderCFoo
{
    [JsonPropertyName("bar_property")]
    public required string BarProperty { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
