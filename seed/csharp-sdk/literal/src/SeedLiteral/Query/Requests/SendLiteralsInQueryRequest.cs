using SeedLiteral.Core;

#nullable enable

namespace SeedLiteral;

public record SendLiteralsInQueryRequest
{
    public required string Prompt { get; set; }

    public required string Query { get; set; }

    public required bool Stream { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
