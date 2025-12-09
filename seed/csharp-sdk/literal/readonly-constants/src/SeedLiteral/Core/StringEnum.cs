using System.Text.Json.Serialization;

namespace SeedLiteral.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
