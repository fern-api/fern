using SeedLiteral.Core;

namespace SeedLiteral;

public record SendLiteralsInQueryRequest
{
    public required string Prompt { get; set; }

    public string? OptionalPrompt { get; set; }

    public required string AliasPrompt { get; set; }

    public string? AliasOptionalPrompt { get; set; }

    public required string Query { get; set; }

    public required bool Stream { get; set; }

    public bool? OptionalStream { get; set; }

    public required bool AliasStream { get; set; }

    public bool? AliasOptionalStream { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
