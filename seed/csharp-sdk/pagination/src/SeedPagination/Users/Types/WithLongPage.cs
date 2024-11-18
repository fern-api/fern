using System.Text.Json.Serialization;
using SeedPagination.Core;

#nullable enable

namespace SeedPagination;

public record WithLongPage
{
    [JsonPropertyName("page")]
    public long? Page { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
