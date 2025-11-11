using System.Text.Json.Serialization;

namespace SeedNoRetries.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
