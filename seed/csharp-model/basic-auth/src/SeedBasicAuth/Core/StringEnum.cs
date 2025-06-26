using System.Text.Json.Serialization;

namespace SeedBasicAuth.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
