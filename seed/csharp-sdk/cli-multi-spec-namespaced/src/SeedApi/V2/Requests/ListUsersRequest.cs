using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi.V2;

[Serializable]
public record ListUsersRequest
{
    [JsonIgnore]
    public int? PageSize { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
