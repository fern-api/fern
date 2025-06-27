using System.Text.Json.Serialization;

namespace SeedMultiUrlEnvironmentNoDefault.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
