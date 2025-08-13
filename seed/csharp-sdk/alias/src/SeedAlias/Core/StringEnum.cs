using System.Text.Json.Serialization;

namespace SeedAlias.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
