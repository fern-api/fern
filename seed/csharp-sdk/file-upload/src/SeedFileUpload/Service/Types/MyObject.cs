using System.Text.Json.Serialization;
using SeedFileUpload.Core;

namespace SeedFileUpload;

public record MyObject
{
    [JsonPropertyName("foo")]
    public required string Foo { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
