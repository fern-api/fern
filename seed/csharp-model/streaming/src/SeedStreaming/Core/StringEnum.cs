using System.Text.Json.Serialization;

namespace SeedStreaming.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
