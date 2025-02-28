using System.Text.Json.Serialization;
using SeedPathParameters.Core;

namespace SeedPathParameters;

public record UpdateUserRequest
{
    [JsonIgnore]
    public required string TenantId { get; set; }

    [JsonIgnore]
    public required string UserId { get; set; }

    public required User Body { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
