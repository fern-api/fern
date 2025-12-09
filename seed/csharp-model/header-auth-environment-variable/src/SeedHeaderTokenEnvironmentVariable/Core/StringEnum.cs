using System.Text.Json.Serialization;

namespace SeedHeaderTokenEnvironmentVariable.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
