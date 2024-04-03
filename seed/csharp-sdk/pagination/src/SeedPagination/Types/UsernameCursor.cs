using System.Text.Json.Serialization;
using SeedPagination;

namespace SeedPagination;

public class UsernameCursor
{
    [JsonPropertyName("cursor")]
    public UsernamePage Cursor { get; init; }
}
