using System.Text.Json.Serialization;

namespace SeedSystem.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
