using SeedValidation.Core;

namespace SeedValidation;

public record GetRequest
{
    public required double Decimal { get; set; }

    public required int Even { get; set; }

    public required string Name { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
