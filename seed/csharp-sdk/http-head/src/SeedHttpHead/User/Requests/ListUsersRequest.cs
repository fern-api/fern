using System.Text.Json.Serialization;
using SeedHttpHead.Core;

namespace SeedHttpHead;

[Serializable]
public record ListUsersRequest
{
    [JsonIgnore]
    public required int Limit { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
