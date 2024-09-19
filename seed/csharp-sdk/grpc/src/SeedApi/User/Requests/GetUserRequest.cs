using SeedApi.Core;

#nullable enable

namespace SeedApi;

public record GetUserRequest
{
    public string? Username { get; set; }

    public uint? Age { get; set; }

    public float? Weight { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
