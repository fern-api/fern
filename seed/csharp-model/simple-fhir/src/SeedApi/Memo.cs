using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

public record Memo
{
    [JsonPropertyName("description")]
    public required string Description { get; set; }

    [JsonPropertyName("account")]
    public Account? Account { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
