using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record ListWithGlobalConfigRequest
{
    [JsonIgnore]
    public int? Offset { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
