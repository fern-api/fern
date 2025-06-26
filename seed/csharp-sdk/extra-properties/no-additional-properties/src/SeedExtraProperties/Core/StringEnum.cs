using System.Text.Json.Serialization;

namespace SeedExtraProperties.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
