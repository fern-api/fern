using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record WithPage
{
    [JsonPropertyName("page")]
    public int? Page { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
