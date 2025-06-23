using System.Text.Json.Serialization;

namespace SeedLicense.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
