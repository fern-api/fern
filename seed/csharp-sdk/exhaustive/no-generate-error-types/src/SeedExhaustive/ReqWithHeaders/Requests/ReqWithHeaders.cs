using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive;

public record ReqWithHeaders
{
    [JsonIgnore]
    public required string XTestServiceHeader { get; set; }

    [JsonIgnore]
    public required string XTestEndpointHeader { get; set; }

    public required string Body { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
