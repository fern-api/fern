using System.Text.Json.Serialization;

namespace SeedAccept.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
