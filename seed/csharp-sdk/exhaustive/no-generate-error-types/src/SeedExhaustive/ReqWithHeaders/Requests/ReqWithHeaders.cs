using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive;

public record ReqWithHeaders
{
    public required string XTestEndpointHeader { get; set; }

    public required string Body { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
