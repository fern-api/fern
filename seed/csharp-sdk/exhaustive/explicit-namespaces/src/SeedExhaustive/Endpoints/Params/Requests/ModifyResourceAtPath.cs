using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.Endpoints.Params;

public record ModifyResourceAtPath
{
    public required string Body { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
