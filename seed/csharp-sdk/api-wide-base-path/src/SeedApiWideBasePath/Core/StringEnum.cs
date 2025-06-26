using System.Text.Json.Serialization;

namespace SeedApiWideBasePath.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
