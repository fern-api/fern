using System.Text.Json.Serialization;
using SeedPathParameters.Core;

namespace SeedPathParameters;

public record SearchOrganizationsRequest
{
    [JsonIgnore]
    public int? Limit { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
