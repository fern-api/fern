using System.Text.Json.Serialization;

namespace SeedApi.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
