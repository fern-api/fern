using SeedPagination.Core;

#nullable enable

namespace SeedPagination;

public record ListUsersExtendedRequestForOptionalData
{
    public string? Cursor { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
