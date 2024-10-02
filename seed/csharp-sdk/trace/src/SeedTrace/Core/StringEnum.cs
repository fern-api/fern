using System.Text.Json.Serialization;

namespace SeedTrace.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
