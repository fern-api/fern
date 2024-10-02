using System.Text.Json.Serialization;

namespace SeedQueryParameters.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
