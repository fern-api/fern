using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record UsernameContainer
{
    [JsonPropertyName("results")]
    public IEnumerable<string> Results { get; set; } = new List<string>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
