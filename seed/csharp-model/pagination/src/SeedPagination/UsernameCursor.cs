using System.Text.Json.Serialization;
using SeedPagination;

#nullable enable

namespace SeedPagination;

public class UsernameCursor
{
    [JsonPropertyName("cursor")]
    public UsernamePage Cursor { get; init; }
}
