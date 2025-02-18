using SeedLiteral.Core;

namespace SeedLiteral;

public record SendLiteralsInQueryRequest
{
    public string Prompt { get; set; } = "You are a helpful assistant";

    public string? OptionalPrompt { get; set; }

    public string AliasPrompt { get; set; } = "You are a helpful assistant";

    public string? AliasOptionalPrompt { get; set; }

    public required string Query { get; set; }

    public bool Stream { get; set; } = false;

    public bool? OptionalStream { get; set; }

    public bool AliasStream { get; set; } = false;

    public bool? AliasOptionalStream { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
