using System.Text.Json.Serialization;

namespace SeedBearerTokenEnvironmentVariable.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
