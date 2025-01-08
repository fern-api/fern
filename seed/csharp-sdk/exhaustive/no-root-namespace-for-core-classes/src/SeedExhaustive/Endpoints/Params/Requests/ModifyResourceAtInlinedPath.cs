using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.Endpoints;

public record ModifyResourceAtInlinedPath
{
    public required string Body { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
