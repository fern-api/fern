using System.Text.Json.Serialization;

namespace SeedVersion.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
