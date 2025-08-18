using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.ReqWithHeaders;

[System.Serializable]
public record ReqWithHeaders
{
    [System.Text.Json.Serialization.JsonIgnore]
    public required string XTestServiceHeader { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    public required string XTestEndpointHeader { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    public required string Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return SeedExhaustive.Core.JsonUtils.Serialize(this);
    }
}
