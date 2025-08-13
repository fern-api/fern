using System.Text.Json.Serialization;

namespace SeedServerSentEvents.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
