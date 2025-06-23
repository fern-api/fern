using System.Text.Json.Serialization;

namespace SeedPathParameters.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
