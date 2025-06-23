using System.Text.Json.Serialization;

namespace SeedAuthEnvironmentVariables.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
