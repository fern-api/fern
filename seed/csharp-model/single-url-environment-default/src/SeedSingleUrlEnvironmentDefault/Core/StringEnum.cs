using System.Text.Json.Serialization;

namespace SeedSingleUrlEnvironmentDefault.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
