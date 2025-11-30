using System.Text.Json.Serialization;

namespace SeedHeaderToken.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
