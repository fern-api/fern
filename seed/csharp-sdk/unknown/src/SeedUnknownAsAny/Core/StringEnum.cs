using System.Text.Json.Serialization;

namespace SeedUnknownAsAny.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
