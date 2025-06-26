using System.Text.Json.Serialization;

namespace SeedBasicAuthEnvironmentVariables.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
