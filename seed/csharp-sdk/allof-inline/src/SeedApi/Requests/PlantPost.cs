using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record PlantPost
{
    /// <summary>
    /// The botanical species name.
    /// </summary>
    [JsonPropertyName("species")]
    public required string Species { get; set; }

    /// <summary>
    /// The botanical family.
    /// </summary>
    [JsonPropertyName("family")]
    public required string Family { get; set; }

    /// <summary>
    /// The botanical genus.
    /// </summary>
    [JsonPropertyName("genus")]
    public required string Genus { get; set; }

    /// <summary>
    /// The common name of the plant.
    /// </summary>
    [JsonPropertyName("commonName")]
    public required string CommonName { get; set; }

    [JsonPropertyName("wateringFrequency")]
    public required PlantPostWateringFrequency WateringFrequency { get; set; }

    /// <summary>
    /// Required sun exposure level.
    /// </summary>
    [JsonPropertyName("sunExposure")]
    public required PlantPostSunExposure SunExposure { get; set; }

    /// <summary>
    /// Date the plant was planted.
    /// </summary>
    [JsonPropertyName("plantedAt")]
    public DateOnly? PlantedAt { get; set; }

    /// <summary>
    /// Preferred soil type.
    /// </summary>
    [JsonPropertyName("soilType")]
    public string? SoilType { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
