using System.Text.Json.Serialization;
using SeedPathParameters.Core;

namespace SeedPathParameters;

public record GetOrganizationUserRequest
{
    [JsonIgnore]
    public required string TenantId { get; set; }

    [JsonIgnore]
    public required string OrganizationId { get; set; }

    [JsonIgnore]
    public required string UserId { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
