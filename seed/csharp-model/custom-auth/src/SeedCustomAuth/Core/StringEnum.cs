using System.Text.Json.Serialization;

namespace SeedCustomAuth.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
