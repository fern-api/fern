using System.Text.Json.Serialization;

namespace SeedSingleUrlEnvironmentNoDefault.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
