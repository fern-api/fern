using SeedFileUpload.Core;

namespace SeedFileUpload;

public record JustFileWithQueryParamsRequest
{
    public string? MaybeString { get; set; }

    public required int Integer { get; set; }

    public int? MaybeInteger { get; set; }

    public IEnumerable<string> ListOfStrings { get; set; } = new List<string>();

    public IEnumerable<string> OptionalListOfStrings { get; set; } = new List<string>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
