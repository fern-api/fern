using System.Text.Json.Serialization;
using SeedHttpHead.Core;

namespace SeedHttpHead;

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
