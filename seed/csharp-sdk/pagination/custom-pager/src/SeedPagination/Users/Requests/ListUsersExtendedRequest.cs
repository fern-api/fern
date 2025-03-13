using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record ListUsersExtendedRequest
{
    [JsonIgnore]
    public string? Cursor { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
