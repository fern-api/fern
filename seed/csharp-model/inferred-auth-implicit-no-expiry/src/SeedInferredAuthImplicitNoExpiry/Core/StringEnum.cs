using System.Text.Json.Serialization;

namespace SeedInferredAuthImplicitNoExpiry.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
