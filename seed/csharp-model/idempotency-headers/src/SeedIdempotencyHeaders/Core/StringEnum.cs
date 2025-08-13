using System.Text.Json.Serialization;

namespace SeedIdempotencyHeaders.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
