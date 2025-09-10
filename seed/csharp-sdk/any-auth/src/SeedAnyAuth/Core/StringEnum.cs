using System.Text.Json.Serialization;

namespace SeedAnyAuth.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
