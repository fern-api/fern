using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record UserOptionalListContainer
{
    [JsonPropertyName("users")]
    public IEnumerable<User>? Users { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
