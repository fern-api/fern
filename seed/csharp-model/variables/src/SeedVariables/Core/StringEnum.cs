using System.Text.Json.Serialization;

namespace SeedVariables.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
