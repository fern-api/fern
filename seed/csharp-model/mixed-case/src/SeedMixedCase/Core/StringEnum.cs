using System.Text.Json.Serialization;

namespace SeedMixedCase.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
