using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive;

[Serializable]
public record ReqWithHeaders
{
    [JsonIgnore]
    public required string XTestServiceHeader { get; set; }

    [JsonIgnore]
    public required string XTestEndpointHeader { get; set; }

    [JsonIgnore]
    public required string Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
