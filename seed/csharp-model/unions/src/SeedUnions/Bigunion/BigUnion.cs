// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(BigUnion.JsonConverter))]
[Serializable]
public record BigUnion
{
    internal BigUnion(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.NormalSweet"/>.
    /// </summary>
    public BigUnion(BigUnion.NormalSweet value)
    {
        Type = "normalSweet";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.ThankfulFactor"/>.
    /// </summary>
    public BigUnion(BigUnion.ThankfulFactor value)
    {
        Type = "thankfulFactor";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.JumboEnd"/>.
    /// </summary>
    public BigUnion(BigUnion.JumboEnd value)
    {
        Type = "jumboEnd";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.HastyPain"/>.
    /// </summary>
    public BigUnion(BigUnion.HastyPain value)
    {
        Type = "hastyPain";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.MistySnow"/>.
    /// </summary>
    public BigUnion(BigUnion.MistySnow value)
    {
        Type = "mistySnow";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.DistinctFailure"/>.
    /// </summary>
    public BigUnion(BigUnion.DistinctFailure value)
    {
        Type = "distinctFailure";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.PracticalPrinciple"/>.
    /// </summary>
    public BigUnion(BigUnion.PracticalPrinciple value)
    {
        Type = "practicalPrinciple";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.LimpingStep"/>.
    /// </summary>
    public BigUnion(BigUnion.LimpingStep value)
    {
        Type = "limpingStep";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.VibrantExcitement"/>.
    /// </summary>
    public BigUnion(BigUnion.VibrantExcitement value)
    {
        Type = "vibrantExcitement";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.ActiveDiamond"/>.
    /// </summary>
    public BigUnion(BigUnion.ActiveDiamond value)
    {
        Type = "activeDiamond";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.PopularLimit"/>.
    /// </summary>
    public BigUnion(BigUnion.PopularLimit value)
    {
        Type = "popularLimit";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.FalseMirror"/>.
    /// </summary>
    public BigUnion(BigUnion.FalseMirror value)
    {
        Type = "falseMirror";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.PrimaryBlock"/>.
    /// </summary>
    public BigUnion(BigUnion.PrimaryBlock value)
    {
        Type = "primaryBlock";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.RotatingRatio"/>.
    /// </summary>
    public BigUnion(BigUnion.RotatingRatio value)
    {
        Type = "rotatingRatio";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.ColorfulCover"/>.
    /// </summary>
    public BigUnion(BigUnion.ColorfulCover value)
    {
        Type = "colorfulCover";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.DisloyalValue"/>.
    /// </summary>
    public BigUnion(BigUnion.DisloyalValue value)
    {
        Type = "disloyalValue";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.GruesomeCoach"/>.
    /// </summary>
    public BigUnion(BigUnion.GruesomeCoach value)
    {
        Type = "gruesomeCoach";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.TotalWork"/>.
    /// </summary>
    public BigUnion(BigUnion.TotalWork value)
    {
        Type = "totalWork";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.HarmoniousPlay"/>.
    /// </summary>
    public BigUnion(BigUnion.HarmoniousPlay value)
    {
        Type = "harmoniousPlay";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.UniqueStress"/>.
    /// </summary>
    public BigUnion(BigUnion.UniqueStress value)
    {
        Type = "uniqueStress";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.UnwillingSmoke"/>.
    /// </summary>
    public BigUnion(BigUnion.UnwillingSmoke value)
    {
        Type = "unwillingSmoke";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.FrozenSleep"/>.
    /// </summary>
    public BigUnion(BigUnion.FrozenSleep value)
    {
        Type = "frozenSleep";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.DiligentDeal"/>.
    /// </summary>
    public BigUnion(BigUnion.DiligentDeal value)
    {
        Type = "diligentDeal";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.AttractiveScript"/>.
    /// </summary>
    public BigUnion(BigUnion.AttractiveScript value)
    {
        Type = "attractiveScript";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.HoarseMouse"/>.
    /// </summary>
    public BigUnion(BigUnion.HoarseMouse value)
    {
        Type = "hoarseMouse";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.CircularCard"/>.
    /// </summary>
    public BigUnion(BigUnion.CircularCard value)
    {
        Type = "circularCard";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.PotableBad"/>.
    /// </summary>
    public BigUnion(BigUnion.PotableBad value)
    {
        Type = "potableBad";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.TriangularRepair"/>.
    /// </summary>
    public BigUnion(BigUnion.TriangularRepair value)
    {
        Type = "triangularRepair";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="BigUnion.GaseousRoad"/>.
    /// </summary>
    public BigUnion(BigUnion.GaseousRoad value)
    {
        Type = "gaseousRoad";
        Value = value.Value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    [JsonPropertyName("type")]
    public string Type { get; internal set; }

    /// <summary>
    /// Discriminated union value
    /// </summary>
    public object? Value { get; internal set; }

    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("created-at")]
    public required DateTime CreatedAt { get; set; }

    [JsonPropertyName("archived-at")]
    public DateTime? ArchivedAt { get; set; }

    /// <summary>
    /// Returns true if <see cref="Type"/> is "normalSweet"
    /// </summary>
    public bool IsNormalSweet => Type == "normalSweet";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "thankfulFactor"
    /// </summary>
    public bool IsThankfulFactor => Type == "thankfulFactor";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "jumboEnd"
    /// </summary>
    public bool IsJumboEnd => Type == "jumboEnd";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "hastyPain"
    /// </summary>
    public bool IsHastyPain => Type == "hastyPain";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "mistySnow"
    /// </summary>
    public bool IsMistySnow => Type == "mistySnow";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "distinctFailure"
    /// </summary>
    public bool IsDistinctFailure => Type == "distinctFailure";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "practicalPrinciple"
    /// </summary>
    public bool IsPracticalPrinciple => Type == "practicalPrinciple";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "limpingStep"
    /// </summary>
    public bool IsLimpingStep => Type == "limpingStep";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "vibrantExcitement"
    /// </summary>
    public bool IsVibrantExcitement => Type == "vibrantExcitement";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "activeDiamond"
    /// </summary>
    public bool IsActiveDiamond => Type == "activeDiamond";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "popularLimit"
    /// </summary>
    public bool IsPopularLimit => Type == "popularLimit";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "falseMirror"
    /// </summary>
    public bool IsFalseMirror => Type == "falseMirror";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "primaryBlock"
    /// </summary>
    public bool IsPrimaryBlock => Type == "primaryBlock";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "rotatingRatio"
    /// </summary>
    public bool IsRotatingRatio => Type == "rotatingRatio";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "colorfulCover"
    /// </summary>
    public bool IsColorfulCover => Type == "colorfulCover";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "disloyalValue"
    /// </summary>
    public bool IsDisloyalValue => Type == "disloyalValue";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "gruesomeCoach"
    /// </summary>
    public bool IsGruesomeCoach => Type == "gruesomeCoach";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "totalWork"
    /// </summary>
    public bool IsTotalWork => Type == "totalWork";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "harmoniousPlay"
    /// </summary>
    public bool IsHarmoniousPlay => Type == "harmoniousPlay";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "uniqueStress"
    /// </summary>
    public bool IsUniqueStress => Type == "uniqueStress";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "unwillingSmoke"
    /// </summary>
    public bool IsUnwillingSmoke => Type == "unwillingSmoke";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "frozenSleep"
    /// </summary>
    public bool IsFrozenSleep => Type == "frozenSleep";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "diligentDeal"
    /// </summary>
    public bool IsDiligentDeal => Type == "diligentDeal";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "attractiveScript"
    /// </summary>
    public bool IsAttractiveScript => Type == "attractiveScript";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "hoarseMouse"
    /// </summary>
    public bool IsHoarseMouse => Type == "hoarseMouse";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "circularCard"
    /// </summary>
    public bool IsCircularCard => Type == "circularCard";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "potableBad"
    /// </summary>
    public bool IsPotableBad => Type == "potableBad";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "triangularRepair"
    /// </summary>
    public bool IsTriangularRepair => Type == "triangularRepair";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "gaseousRoad"
    /// </summary>
    public bool IsGaseousRoad => Type == "gaseousRoad";

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.NormalSweet"/> if <see cref="Type"/> is 'normalSweet', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'normalSweet'.</exception>
    public SeedUnions.NormalSweet AsNormalSweet() =>
        IsNormalSweet
            ? (SeedUnions.NormalSweet)Value!
            : throw new System.Exception("BigUnion.Type is not 'normalSweet'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.ThankfulFactor"/> if <see cref="Type"/> is 'thankfulFactor', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'thankfulFactor'.</exception>
    public SeedUnions.ThankfulFactor AsThankfulFactor() =>
        IsThankfulFactor
            ? (SeedUnions.ThankfulFactor)Value!
            : throw new System.Exception("BigUnion.Type is not 'thankfulFactor'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.JumboEnd"/> if <see cref="Type"/> is 'jumboEnd', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'jumboEnd'.</exception>
    public SeedUnions.JumboEnd AsJumboEnd() =>
        IsJumboEnd
            ? (SeedUnions.JumboEnd)Value!
            : throw new System.Exception("BigUnion.Type is not 'jumboEnd'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.HastyPain"/> if <see cref="Type"/> is 'hastyPain', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'hastyPain'.</exception>
    public SeedUnions.HastyPain AsHastyPain() =>
        IsHastyPain
            ? (SeedUnions.HastyPain)Value!
            : throw new System.Exception("BigUnion.Type is not 'hastyPain'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.MistySnow"/> if <see cref="Type"/> is 'mistySnow', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'mistySnow'.</exception>
    public SeedUnions.MistySnow AsMistySnow() =>
        IsMistySnow
            ? (SeedUnions.MistySnow)Value!
            : throw new System.Exception("BigUnion.Type is not 'mistySnow'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.DistinctFailure"/> if <see cref="Type"/> is 'distinctFailure', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'distinctFailure'.</exception>
    public SeedUnions.DistinctFailure AsDistinctFailure() =>
        IsDistinctFailure
            ? (SeedUnions.DistinctFailure)Value!
            : throw new System.Exception("BigUnion.Type is not 'distinctFailure'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.PracticalPrinciple"/> if <see cref="Type"/> is 'practicalPrinciple', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'practicalPrinciple'.</exception>
    public SeedUnions.PracticalPrinciple AsPracticalPrinciple() =>
        IsPracticalPrinciple
            ? (SeedUnions.PracticalPrinciple)Value!
            : throw new System.Exception("BigUnion.Type is not 'practicalPrinciple'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.LimpingStep"/> if <see cref="Type"/> is 'limpingStep', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'limpingStep'.</exception>
    public SeedUnions.LimpingStep AsLimpingStep() =>
        IsLimpingStep
            ? (SeedUnions.LimpingStep)Value!
            : throw new System.Exception("BigUnion.Type is not 'limpingStep'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.VibrantExcitement"/> if <see cref="Type"/> is 'vibrantExcitement', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'vibrantExcitement'.</exception>
    public SeedUnions.VibrantExcitement AsVibrantExcitement() =>
        IsVibrantExcitement
            ? (SeedUnions.VibrantExcitement)Value!
            : throw new System.Exception("BigUnion.Type is not 'vibrantExcitement'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.ActiveDiamond"/> if <see cref="Type"/> is 'activeDiamond', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'activeDiamond'.</exception>
    public SeedUnions.ActiveDiamond AsActiveDiamond() =>
        IsActiveDiamond
            ? (SeedUnions.ActiveDiamond)Value!
            : throw new System.Exception("BigUnion.Type is not 'activeDiamond'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.PopularLimit"/> if <see cref="Type"/> is 'popularLimit', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'popularLimit'.</exception>
    public SeedUnions.PopularLimit AsPopularLimit() =>
        IsPopularLimit
            ? (SeedUnions.PopularLimit)Value!
            : throw new System.Exception("BigUnion.Type is not 'popularLimit'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.FalseMirror"/> if <see cref="Type"/> is 'falseMirror', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'falseMirror'.</exception>
    public SeedUnions.FalseMirror AsFalseMirror() =>
        IsFalseMirror
            ? (SeedUnions.FalseMirror)Value!
            : throw new System.Exception("BigUnion.Type is not 'falseMirror'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.PrimaryBlock"/> if <see cref="Type"/> is 'primaryBlock', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'primaryBlock'.</exception>
    public SeedUnions.PrimaryBlock AsPrimaryBlock() =>
        IsPrimaryBlock
            ? (SeedUnions.PrimaryBlock)Value!
            : throw new System.Exception("BigUnion.Type is not 'primaryBlock'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.RotatingRatio"/> if <see cref="Type"/> is 'rotatingRatio', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'rotatingRatio'.</exception>
    public SeedUnions.RotatingRatio AsRotatingRatio() =>
        IsRotatingRatio
            ? (SeedUnions.RotatingRatio)Value!
            : throw new System.Exception("BigUnion.Type is not 'rotatingRatio'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.ColorfulCover"/> if <see cref="Type"/> is 'colorfulCover', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'colorfulCover'.</exception>
    public SeedUnions.ColorfulCover AsColorfulCover() =>
        IsColorfulCover
            ? (SeedUnions.ColorfulCover)Value!
            : throw new System.Exception("BigUnion.Type is not 'colorfulCover'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.DisloyalValue"/> if <see cref="Type"/> is 'disloyalValue', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'disloyalValue'.</exception>
    public SeedUnions.DisloyalValue AsDisloyalValue() =>
        IsDisloyalValue
            ? (SeedUnions.DisloyalValue)Value!
            : throw new System.Exception("BigUnion.Type is not 'disloyalValue'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.GruesomeCoach"/> if <see cref="Type"/> is 'gruesomeCoach', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'gruesomeCoach'.</exception>
    public SeedUnions.GruesomeCoach AsGruesomeCoach() =>
        IsGruesomeCoach
            ? (SeedUnions.GruesomeCoach)Value!
            : throw new System.Exception("BigUnion.Type is not 'gruesomeCoach'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.TotalWork"/> if <see cref="Type"/> is 'totalWork', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'totalWork'.</exception>
    public SeedUnions.TotalWork AsTotalWork() =>
        IsTotalWork
            ? (SeedUnions.TotalWork)Value!
            : throw new System.Exception("BigUnion.Type is not 'totalWork'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.HarmoniousPlay"/> if <see cref="Type"/> is 'harmoniousPlay', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'harmoniousPlay'.</exception>
    public SeedUnions.HarmoniousPlay AsHarmoniousPlay() =>
        IsHarmoniousPlay
            ? (SeedUnions.HarmoniousPlay)Value!
            : throw new System.Exception("BigUnion.Type is not 'harmoniousPlay'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.UniqueStress"/> if <see cref="Type"/> is 'uniqueStress', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'uniqueStress'.</exception>
    public SeedUnions.UniqueStress AsUniqueStress() =>
        IsUniqueStress
            ? (SeedUnions.UniqueStress)Value!
            : throw new System.Exception("BigUnion.Type is not 'uniqueStress'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.UnwillingSmoke"/> if <see cref="Type"/> is 'unwillingSmoke', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'unwillingSmoke'.</exception>
    public SeedUnions.UnwillingSmoke AsUnwillingSmoke() =>
        IsUnwillingSmoke
            ? (SeedUnions.UnwillingSmoke)Value!
            : throw new System.Exception("BigUnion.Type is not 'unwillingSmoke'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.FrozenSleep"/> if <see cref="Type"/> is 'frozenSleep', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'frozenSleep'.</exception>
    public SeedUnions.FrozenSleep AsFrozenSleep() =>
        IsFrozenSleep
            ? (SeedUnions.FrozenSleep)Value!
            : throw new System.Exception("BigUnion.Type is not 'frozenSleep'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.DiligentDeal"/> if <see cref="Type"/> is 'diligentDeal', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'diligentDeal'.</exception>
    public SeedUnions.DiligentDeal AsDiligentDeal() =>
        IsDiligentDeal
            ? (SeedUnions.DiligentDeal)Value!
            : throw new System.Exception("BigUnion.Type is not 'diligentDeal'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.AttractiveScript"/> if <see cref="Type"/> is 'attractiveScript', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'attractiveScript'.</exception>
    public SeedUnions.AttractiveScript AsAttractiveScript() =>
        IsAttractiveScript
            ? (SeedUnions.AttractiveScript)Value!
            : throw new System.Exception("BigUnion.Type is not 'attractiveScript'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.HoarseMouse"/> if <see cref="Type"/> is 'hoarseMouse', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'hoarseMouse'.</exception>
    public SeedUnions.HoarseMouse AsHoarseMouse() =>
        IsHoarseMouse
            ? (SeedUnions.HoarseMouse)Value!
            : throw new System.Exception("BigUnion.Type is not 'hoarseMouse'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.CircularCard"/> if <see cref="Type"/> is 'circularCard', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'circularCard'.</exception>
    public SeedUnions.CircularCard AsCircularCard() =>
        IsCircularCard
            ? (SeedUnions.CircularCard)Value!
            : throw new System.Exception("BigUnion.Type is not 'circularCard'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.PotableBad"/> if <see cref="Type"/> is 'potableBad', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'potableBad'.</exception>
    public SeedUnions.PotableBad AsPotableBad() =>
        IsPotableBad
            ? (SeedUnions.PotableBad)Value!
            : throw new System.Exception("BigUnion.Type is not 'potableBad'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.TriangularRepair"/> if <see cref="Type"/> is 'triangularRepair', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'triangularRepair'.</exception>
    public SeedUnions.TriangularRepair AsTriangularRepair() =>
        IsTriangularRepair
            ? (SeedUnions.TriangularRepair)Value!
            : throw new System.Exception("BigUnion.Type is not 'triangularRepair'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.GaseousRoad"/> if <see cref="Type"/> is 'gaseousRoad', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'gaseousRoad'.</exception>
    public SeedUnions.GaseousRoad AsGaseousRoad() =>
        IsGaseousRoad
            ? (SeedUnions.GaseousRoad)Value!
            : throw new System.Exception("BigUnion.Type is not 'gaseousRoad'");

    public T Match<T>(
        Func<SeedUnions.NormalSweet, T> onNormalSweet,
        Func<SeedUnions.ThankfulFactor, T> onThankfulFactor,
        Func<SeedUnions.JumboEnd, T> onJumboEnd,
        Func<SeedUnions.HastyPain, T> onHastyPain,
        Func<SeedUnions.MistySnow, T> onMistySnow,
        Func<SeedUnions.DistinctFailure, T> onDistinctFailure,
        Func<SeedUnions.PracticalPrinciple, T> onPracticalPrinciple,
        Func<SeedUnions.LimpingStep, T> onLimpingStep,
        Func<SeedUnions.VibrantExcitement, T> onVibrantExcitement,
        Func<SeedUnions.ActiveDiamond, T> onActiveDiamond,
        Func<SeedUnions.PopularLimit, T> onPopularLimit,
        Func<SeedUnions.FalseMirror, T> onFalseMirror,
        Func<SeedUnions.PrimaryBlock, T> onPrimaryBlock,
        Func<SeedUnions.RotatingRatio, T> onRotatingRatio,
        Func<SeedUnions.ColorfulCover, T> onColorfulCover,
        Func<SeedUnions.DisloyalValue, T> onDisloyalValue,
        Func<SeedUnions.GruesomeCoach, T> onGruesomeCoach,
        Func<SeedUnions.TotalWork, T> onTotalWork,
        Func<SeedUnions.HarmoniousPlay, T> onHarmoniousPlay,
        Func<SeedUnions.UniqueStress, T> onUniqueStress,
        Func<SeedUnions.UnwillingSmoke, T> onUnwillingSmoke,
        Func<SeedUnions.FrozenSleep, T> onFrozenSleep,
        Func<SeedUnions.DiligentDeal, T> onDiligentDeal,
        Func<SeedUnions.AttractiveScript, T> onAttractiveScript,
        Func<SeedUnions.HoarseMouse, T> onHoarseMouse,
        Func<SeedUnions.CircularCard, T> onCircularCard,
        Func<SeedUnions.PotableBad, T> onPotableBad,
        Func<SeedUnions.TriangularRepair, T> onTriangularRepair,
        Func<SeedUnions.GaseousRoad, T> onGaseousRoad,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "normalSweet" => onNormalSweet(AsNormalSweet()),
            "thankfulFactor" => onThankfulFactor(AsThankfulFactor()),
            "jumboEnd" => onJumboEnd(AsJumboEnd()),
            "hastyPain" => onHastyPain(AsHastyPain()),
            "mistySnow" => onMistySnow(AsMistySnow()),
            "distinctFailure" => onDistinctFailure(AsDistinctFailure()),
            "practicalPrinciple" => onPracticalPrinciple(AsPracticalPrinciple()),
            "limpingStep" => onLimpingStep(AsLimpingStep()),
            "vibrantExcitement" => onVibrantExcitement(AsVibrantExcitement()),
            "activeDiamond" => onActiveDiamond(AsActiveDiamond()),
            "popularLimit" => onPopularLimit(AsPopularLimit()),
            "falseMirror" => onFalseMirror(AsFalseMirror()),
            "primaryBlock" => onPrimaryBlock(AsPrimaryBlock()),
            "rotatingRatio" => onRotatingRatio(AsRotatingRatio()),
            "colorfulCover" => onColorfulCover(AsColorfulCover()),
            "disloyalValue" => onDisloyalValue(AsDisloyalValue()),
            "gruesomeCoach" => onGruesomeCoach(AsGruesomeCoach()),
            "totalWork" => onTotalWork(AsTotalWork()),
            "harmoniousPlay" => onHarmoniousPlay(AsHarmoniousPlay()),
            "uniqueStress" => onUniqueStress(AsUniqueStress()),
            "unwillingSmoke" => onUnwillingSmoke(AsUnwillingSmoke()),
            "frozenSleep" => onFrozenSleep(AsFrozenSleep()),
            "diligentDeal" => onDiligentDeal(AsDiligentDeal()),
            "attractiveScript" => onAttractiveScript(AsAttractiveScript()),
            "hoarseMouse" => onHoarseMouse(AsHoarseMouse()),
            "circularCard" => onCircularCard(AsCircularCard()),
            "potableBad" => onPotableBad(AsPotableBad()),
            "triangularRepair" => onTriangularRepair(AsTriangularRepair()),
            "gaseousRoad" => onGaseousRoad(AsGaseousRoad()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedUnions.NormalSweet> onNormalSweet,
        Action<SeedUnions.ThankfulFactor> onThankfulFactor,
        Action<SeedUnions.JumboEnd> onJumboEnd,
        Action<SeedUnions.HastyPain> onHastyPain,
        Action<SeedUnions.MistySnow> onMistySnow,
        Action<SeedUnions.DistinctFailure> onDistinctFailure,
        Action<SeedUnions.PracticalPrinciple> onPracticalPrinciple,
        Action<SeedUnions.LimpingStep> onLimpingStep,
        Action<SeedUnions.VibrantExcitement> onVibrantExcitement,
        Action<SeedUnions.ActiveDiamond> onActiveDiamond,
        Action<SeedUnions.PopularLimit> onPopularLimit,
        Action<SeedUnions.FalseMirror> onFalseMirror,
        Action<SeedUnions.PrimaryBlock> onPrimaryBlock,
        Action<SeedUnions.RotatingRatio> onRotatingRatio,
        Action<SeedUnions.ColorfulCover> onColorfulCover,
        Action<SeedUnions.DisloyalValue> onDisloyalValue,
        Action<SeedUnions.GruesomeCoach> onGruesomeCoach,
        Action<SeedUnions.TotalWork> onTotalWork,
        Action<SeedUnions.HarmoniousPlay> onHarmoniousPlay,
        Action<SeedUnions.UniqueStress> onUniqueStress,
        Action<SeedUnions.UnwillingSmoke> onUnwillingSmoke,
        Action<SeedUnions.FrozenSleep> onFrozenSleep,
        Action<SeedUnions.DiligentDeal> onDiligentDeal,
        Action<SeedUnions.AttractiveScript> onAttractiveScript,
        Action<SeedUnions.HoarseMouse> onHoarseMouse,
        Action<SeedUnions.CircularCard> onCircularCard,
        Action<SeedUnions.PotableBad> onPotableBad,
        Action<SeedUnions.TriangularRepair> onTriangularRepair,
        Action<SeedUnions.GaseousRoad> onGaseousRoad,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "normalSweet":
                onNormalSweet(AsNormalSweet());
                break;
            case "thankfulFactor":
                onThankfulFactor(AsThankfulFactor());
                break;
            case "jumboEnd":
                onJumboEnd(AsJumboEnd());
                break;
            case "hastyPain":
                onHastyPain(AsHastyPain());
                break;
            case "mistySnow":
                onMistySnow(AsMistySnow());
                break;
            case "distinctFailure":
                onDistinctFailure(AsDistinctFailure());
                break;
            case "practicalPrinciple":
                onPracticalPrinciple(AsPracticalPrinciple());
                break;
            case "limpingStep":
                onLimpingStep(AsLimpingStep());
                break;
            case "vibrantExcitement":
                onVibrantExcitement(AsVibrantExcitement());
                break;
            case "activeDiamond":
                onActiveDiamond(AsActiveDiamond());
                break;
            case "popularLimit":
                onPopularLimit(AsPopularLimit());
                break;
            case "falseMirror":
                onFalseMirror(AsFalseMirror());
                break;
            case "primaryBlock":
                onPrimaryBlock(AsPrimaryBlock());
                break;
            case "rotatingRatio":
                onRotatingRatio(AsRotatingRatio());
                break;
            case "colorfulCover":
                onColorfulCover(AsColorfulCover());
                break;
            case "disloyalValue":
                onDisloyalValue(AsDisloyalValue());
                break;
            case "gruesomeCoach":
                onGruesomeCoach(AsGruesomeCoach());
                break;
            case "totalWork":
                onTotalWork(AsTotalWork());
                break;
            case "harmoniousPlay":
                onHarmoniousPlay(AsHarmoniousPlay());
                break;
            case "uniqueStress":
                onUniqueStress(AsUniqueStress());
                break;
            case "unwillingSmoke":
                onUnwillingSmoke(AsUnwillingSmoke());
                break;
            case "frozenSleep":
                onFrozenSleep(AsFrozenSleep());
                break;
            case "diligentDeal":
                onDiligentDeal(AsDiligentDeal());
                break;
            case "attractiveScript":
                onAttractiveScript(AsAttractiveScript());
                break;
            case "hoarseMouse":
                onHoarseMouse(AsHoarseMouse());
                break;
            case "circularCard":
                onCircularCard(AsCircularCard());
                break;
            case "potableBad":
                onPotableBad(AsPotableBad());
                break;
            case "triangularRepair":
                onTriangularRepair(AsTriangularRepair());
                break;
            case "gaseousRoad":
                onGaseousRoad(AsGaseousRoad());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.NormalSweet"/> and returns true if successful.
    /// </summary>
    public bool TryAsNormalSweet(out SeedUnions.NormalSweet? value)
    {
        if (Type == "normalSweet")
        {
            value = (SeedUnions.NormalSweet)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.ThankfulFactor"/> and returns true if successful.
    /// </summary>
    public bool TryAsThankfulFactor(out SeedUnions.ThankfulFactor? value)
    {
        if (Type == "thankfulFactor")
        {
            value = (SeedUnions.ThankfulFactor)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.JumboEnd"/> and returns true if successful.
    /// </summary>
    public bool TryAsJumboEnd(out SeedUnions.JumboEnd? value)
    {
        if (Type == "jumboEnd")
        {
            value = (SeedUnions.JumboEnd)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.HastyPain"/> and returns true if successful.
    /// </summary>
    public bool TryAsHastyPain(out SeedUnions.HastyPain? value)
    {
        if (Type == "hastyPain")
        {
            value = (SeedUnions.HastyPain)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.MistySnow"/> and returns true if successful.
    /// </summary>
    public bool TryAsMistySnow(out SeedUnions.MistySnow? value)
    {
        if (Type == "mistySnow")
        {
            value = (SeedUnions.MistySnow)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.DistinctFailure"/> and returns true if successful.
    /// </summary>
    public bool TryAsDistinctFailure(out SeedUnions.DistinctFailure? value)
    {
        if (Type == "distinctFailure")
        {
            value = (SeedUnions.DistinctFailure)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.PracticalPrinciple"/> and returns true if successful.
    /// </summary>
    public bool TryAsPracticalPrinciple(out SeedUnions.PracticalPrinciple? value)
    {
        if (Type == "practicalPrinciple")
        {
            value = (SeedUnions.PracticalPrinciple)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.LimpingStep"/> and returns true if successful.
    /// </summary>
    public bool TryAsLimpingStep(out SeedUnions.LimpingStep? value)
    {
        if (Type == "limpingStep")
        {
            value = (SeedUnions.LimpingStep)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.VibrantExcitement"/> and returns true if successful.
    /// </summary>
    public bool TryAsVibrantExcitement(out SeedUnions.VibrantExcitement? value)
    {
        if (Type == "vibrantExcitement")
        {
            value = (SeedUnions.VibrantExcitement)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.ActiveDiamond"/> and returns true if successful.
    /// </summary>
    public bool TryAsActiveDiamond(out SeedUnions.ActiveDiamond? value)
    {
        if (Type == "activeDiamond")
        {
            value = (SeedUnions.ActiveDiamond)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.PopularLimit"/> and returns true if successful.
    /// </summary>
    public bool TryAsPopularLimit(out SeedUnions.PopularLimit? value)
    {
        if (Type == "popularLimit")
        {
            value = (SeedUnions.PopularLimit)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.FalseMirror"/> and returns true if successful.
    /// </summary>
    public bool TryAsFalseMirror(out SeedUnions.FalseMirror? value)
    {
        if (Type == "falseMirror")
        {
            value = (SeedUnions.FalseMirror)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.PrimaryBlock"/> and returns true if successful.
    /// </summary>
    public bool TryAsPrimaryBlock(out SeedUnions.PrimaryBlock? value)
    {
        if (Type == "primaryBlock")
        {
            value = (SeedUnions.PrimaryBlock)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.RotatingRatio"/> and returns true if successful.
    /// </summary>
    public bool TryAsRotatingRatio(out SeedUnions.RotatingRatio? value)
    {
        if (Type == "rotatingRatio")
        {
            value = (SeedUnions.RotatingRatio)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.ColorfulCover"/> and returns true if successful.
    /// </summary>
    public bool TryAsColorfulCover(out SeedUnions.ColorfulCover? value)
    {
        if (Type == "colorfulCover")
        {
            value = (SeedUnions.ColorfulCover)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.DisloyalValue"/> and returns true if successful.
    /// </summary>
    public bool TryAsDisloyalValue(out SeedUnions.DisloyalValue? value)
    {
        if (Type == "disloyalValue")
        {
            value = (SeedUnions.DisloyalValue)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.GruesomeCoach"/> and returns true if successful.
    /// </summary>
    public bool TryAsGruesomeCoach(out SeedUnions.GruesomeCoach? value)
    {
        if (Type == "gruesomeCoach")
        {
            value = (SeedUnions.GruesomeCoach)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.TotalWork"/> and returns true if successful.
    /// </summary>
    public bool TryAsTotalWork(out SeedUnions.TotalWork? value)
    {
        if (Type == "totalWork")
        {
            value = (SeedUnions.TotalWork)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.HarmoniousPlay"/> and returns true if successful.
    /// </summary>
    public bool TryAsHarmoniousPlay(out SeedUnions.HarmoniousPlay? value)
    {
        if (Type == "harmoniousPlay")
        {
            value = (SeedUnions.HarmoniousPlay)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.UniqueStress"/> and returns true if successful.
    /// </summary>
    public bool TryAsUniqueStress(out SeedUnions.UniqueStress? value)
    {
        if (Type == "uniqueStress")
        {
            value = (SeedUnions.UniqueStress)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.UnwillingSmoke"/> and returns true if successful.
    /// </summary>
    public bool TryAsUnwillingSmoke(out SeedUnions.UnwillingSmoke? value)
    {
        if (Type == "unwillingSmoke")
        {
            value = (SeedUnions.UnwillingSmoke)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.FrozenSleep"/> and returns true if successful.
    /// </summary>
    public bool TryAsFrozenSleep(out SeedUnions.FrozenSleep? value)
    {
        if (Type == "frozenSleep")
        {
            value = (SeedUnions.FrozenSleep)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.DiligentDeal"/> and returns true if successful.
    /// </summary>
    public bool TryAsDiligentDeal(out SeedUnions.DiligentDeal? value)
    {
        if (Type == "diligentDeal")
        {
            value = (SeedUnions.DiligentDeal)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.AttractiveScript"/> and returns true if successful.
    /// </summary>
    public bool TryAsAttractiveScript(out SeedUnions.AttractiveScript? value)
    {
        if (Type == "attractiveScript")
        {
            value = (SeedUnions.AttractiveScript)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.HoarseMouse"/> and returns true if successful.
    /// </summary>
    public bool TryAsHoarseMouse(out SeedUnions.HoarseMouse? value)
    {
        if (Type == "hoarseMouse")
        {
            value = (SeedUnions.HoarseMouse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.CircularCard"/> and returns true if successful.
    /// </summary>
    public bool TryAsCircularCard(out SeedUnions.CircularCard? value)
    {
        if (Type == "circularCard")
        {
            value = (SeedUnions.CircularCard)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.PotableBad"/> and returns true if successful.
    /// </summary>
    public bool TryAsPotableBad(out SeedUnions.PotableBad? value)
    {
        if (Type == "potableBad")
        {
            value = (SeedUnions.PotableBad)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.TriangularRepair"/> and returns true if successful.
    /// </summary>
    public bool TryAsTriangularRepair(out SeedUnions.TriangularRepair? value)
    {
        if (Type == "triangularRepair")
        {
            value = (SeedUnions.TriangularRepair)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.GaseousRoad"/> and returns true if successful.
    /// </summary>
    public bool TryAsGaseousRoad(out SeedUnions.GaseousRoad? value)
    {
        if (Type == "gaseousRoad")
        {
            value = (SeedUnions.GaseousRoad)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    /// <summary>
    /// Base properties for the discriminated union
    /// </summary>
    [Serializable]
    internal record BaseProperties
    {
        [JsonPropertyName("id")]
        public required string Id { get; set; }

        [JsonPropertyName("created-at")]
        public required DateTime CreatedAt { get; set; }

        [JsonPropertyName("archived-at")]
        public DateTime? ArchivedAt { get; set; }
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<BigUnion>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(BigUnion).IsAssignableFrom(typeToConvert);

        public override BigUnion Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = JsonElement.ParseValue(ref reader);
            if (!json.TryGetProperty("type", out var discriminatorElement))
            {
                throw new JsonException("Missing discriminator property 'type'");
            }
            if (discriminatorElement.ValueKind != JsonValueKind.String)
            {
                if (discriminatorElement.ValueKind == JsonValueKind.Null)
                {
                    throw new JsonException("Discriminator property 'type' is null");
                }

                throw new JsonException(
                    $"Discriminator property 'type' is not a string, instead is {discriminatorElement.ToString()}"
                );
            }

            var discriminator =
                discriminatorElement.GetString()
                ?? throw new JsonException("Discriminator property 'type' is null");

            var value = discriminator switch
            {
                "normalSweet" => json.Deserialize<SeedUnions.NormalSweet?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.NormalSweet"),
                "thankfulFactor" => json.Deserialize<SeedUnions.ThankfulFactor?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.ThankfulFactor"),
                "jumboEnd" => json.Deserialize<SeedUnions.JumboEnd?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.JumboEnd"),
                "hastyPain" => json.Deserialize<SeedUnions.HastyPain?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.HastyPain"),
                "mistySnow" => json.Deserialize<SeedUnions.MistySnow?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.MistySnow"),
                "distinctFailure" => json.Deserialize<SeedUnions.DistinctFailure?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.DistinctFailure"),
                "practicalPrinciple" => json.Deserialize<SeedUnions.PracticalPrinciple?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedUnions.PracticalPrinciple"
                    ),
                "limpingStep" => json.Deserialize<SeedUnions.LimpingStep?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.LimpingStep"),
                "vibrantExcitement" => json.Deserialize<SeedUnions.VibrantExcitement?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedUnions.VibrantExcitement"
                    ),
                "activeDiamond" => json.Deserialize<SeedUnions.ActiveDiamond?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.ActiveDiamond"),
                "popularLimit" => json.Deserialize<SeedUnions.PopularLimit?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.PopularLimit"),
                "falseMirror" => json.Deserialize<SeedUnions.FalseMirror?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.FalseMirror"),
                "primaryBlock" => json.Deserialize<SeedUnions.PrimaryBlock?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.PrimaryBlock"),
                "rotatingRatio" => json.Deserialize<SeedUnions.RotatingRatio?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.RotatingRatio"),
                "colorfulCover" => json.Deserialize<SeedUnions.ColorfulCover?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.ColorfulCover"),
                "disloyalValue" => json.Deserialize<SeedUnions.DisloyalValue?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.DisloyalValue"),
                "gruesomeCoach" => json.Deserialize<SeedUnions.GruesomeCoach?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.GruesomeCoach"),
                "totalWork" => json.Deserialize<SeedUnions.TotalWork?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.TotalWork"),
                "harmoniousPlay" => json.Deserialize<SeedUnions.HarmoniousPlay?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.HarmoniousPlay"),
                "uniqueStress" => json.Deserialize<SeedUnions.UniqueStress?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.UniqueStress"),
                "unwillingSmoke" => json.Deserialize<SeedUnions.UnwillingSmoke?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.UnwillingSmoke"),
                "frozenSleep" => json.Deserialize<SeedUnions.FrozenSleep?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.FrozenSleep"),
                "diligentDeal" => json.Deserialize<SeedUnions.DiligentDeal?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.DiligentDeal"),
                "attractiveScript" => json.Deserialize<SeedUnions.AttractiveScript?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.AttractiveScript"),
                "hoarseMouse" => json.Deserialize<SeedUnions.HoarseMouse?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.HoarseMouse"),
                "circularCard" => json.Deserialize<SeedUnions.CircularCard?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.CircularCard"),
                "potableBad" => json.Deserialize<SeedUnions.PotableBad?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.PotableBad"),
                "triangularRepair" => json.Deserialize<SeedUnions.TriangularRepair?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.TriangularRepair"),
                "gaseousRoad" => json.Deserialize<SeedUnions.GaseousRoad?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.GaseousRoad"),
                _ => json.Deserialize<object?>(options),
            };
            var baseProperties =
                json.Deserialize<BigUnion.BaseProperties>(options)
                ?? throw new JsonException("Failed to deserialize BigUnion.BaseProperties");
            return new BigUnion(discriminator, value)
            {
                Id = baseProperties.Id,
                CreatedAt = baseProperties.CreatedAt,
                ArchivedAt = baseProperties.ArchivedAt,
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigUnion value,
            JsonSerializerOptions options
        )
        {
            JsonObject json =
                value.Type switch
                {
                    "normalSweet" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "thankfulFactor" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "jumboEnd" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "hastyPain" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "mistySnow" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "distinctFailure" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "practicalPrinciple" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "limpingStep" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "vibrantExcitement" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "activeDiamond" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "popularLimit" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "falseMirror" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "primaryBlock" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "rotatingRatio" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "colorfulCover" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "disloyalValue" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "gruesomeCoach" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "totalWork" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "harmoniousPlay" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "uniqueStress" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "unwillingSmoke" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "frozenSleep" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "diligentDeal" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "attractiveScript" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "hoarseMouse" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "circularCard" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "potableBad" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "triangularRepair" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "gaseousRoad" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    _ => JsonSerializer.SerializeToNode(value.Value, options) as JsonObject,
                } ?? new JsonObject();
            json["type"] = value.Type;
            var basePropertiesJson =
                JsonSerializer.SerializeToNode(
                    new BigUnion.BaseProperties
                    {
                        Id = value.Id,
                        CreatedAt = value.CreatedAt,
                        ArchivedAt = value.ArchivedAt,
                    },
                    options
                ) ?? throw new JsonException("Failed to serialize BigUnion.BaseProperties");
            foreach (var property in basePropertiesJson.AsObject())
            {
                json[property.Key] = property.Value;
            }
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for normalSweet
    /// </summary>
    [Serializable]
    public struct NormalSweet
    {
        public NormalSweet(SeedUnions.NormalSweet value)
        {
            Value = value;
        }

        internal SeedUnions.NormalSweet Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.NormalSweet(SeedUnions.NormalSweet value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for thankfulFactor
    /// </summary>
    [Serializable]
    public struct ThankfulFactor
    {
        public ThankfulFactor(SeedUnions.ThankfulFactor value)
        {
            Value = value;
        }

        internal SeedUnions.ThankfulFactor Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.ThankfulFactor(SeedUnions.ThankfulFactor value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for jumboEnd
    /// </summary>
    [Serializable]
    public struct JumboEnd
    {
        public JumboEnd(SeedUnions.JumboEnd value)
        {
            Value = value;
        }

        internal SeedUnions.JumboEnd Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.JumboEnd(SeedUnions.JumboEnd value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for hastyPain
    /// </summary>
    [Serializable]
    public struct HastyPain
    {
        public HastyPain(SeedUnions.HastyPain value)
        {
            Value = value;
        }

        internal SeedUnions.HastyPain Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.HastyPain(SeedUnions.HastyPain value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for mistySnow
    /// </summary>
    [Serializable]
    public struct MistySnow
    {
        public MistySnow(SeedUnions.MistySnow value)
        {
            Value = value;
        }

        internal SeedUnions.MistySnow Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.MistySnow(SeedUnions.MistySnow value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for distinctFailure
    /// </summary>
    [Serializable]
    public struct DistinctFailure
    {
        public DistinctFailure(SeedUnions.DistinctFailure value)
        {
            Value = value;
        }

        internal SeedUnions.DistinctFailure Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.DistinctFailure(
            SeedUnions.DistinctFailure value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for practicalPrinciple
    /// </summary>
    [Serializable]
    public struct PracticalPrinciple
    {
        public PracticalPrinciple(SeedUnions.PracticalPrinciple value)
        {
            Value = value;
        }

        internal SeedUnions.PracticalPrinciple Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.PracticalPrinciple(
            SeedUnions.PracticalPrinciple value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for limpingStep
    /// </summary>
    [Serializable]
    public struct LimpingStep
    {
        public LimpingStep(SeedUnions.LimpingStep value)
        {
            Value = value;
        }

        internal SeedUnions.LimpingStep Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.LimpingStep(SeedUnions.LimpingStep value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for vibrantExcitement
    /// </summary>
    [Serializable]
    public struct VibrantExcitement
    {
        public VibrantExcitement(SeedUnions.VibrantExcitement value)
        {
            Value = value;
        }

        internal SeedUnions.VibrantExcitement Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.VibrantExcitement(
            SeedUnions.VibrantExcitement value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for activeDiamond
    /// </summary>
    [Serializable]
    public struct ActiveDiamond
    {
        public ActiveDiamond(SeedUnions.ActiveDiamond value)
        {
            Value = value;
        }

        internal SeedUnions.ActiveDiamond Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.ActiveDiamond(SeedUnions.ActiveDiamond value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for popularLimit
    /// </summary>
    [Serializable]
    public struct PopularLimit
    {
        public PopularLimit(SeedUnions.PopularLimit value)
        {
            Value = value;
        }

        internal SeedUnions.PopularLimit Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.PopularLimit(SeedUnions.PopularLimit value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for falseMirror
    /// </summary>
    [Serializable]
    public struct FalseMirror
    {
        public FalseMirror(SeedUnions.FalseMirror value)
        {
            Value = value;
        }

        internal SeedUnions.FalseMirror Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.FalseMirror(SeedUnions.FalseMirror value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for primaryBlock
    /// </summary>
    [Serializable]
    public struct PrimaryBlock
    {
        public PrimaryBlock(SeedUnions.PrimaryBlock value)
        {
            Value = value;
        }

        internal SeedUnions.PrimaryBlock Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.PrimaryBlock(SeedUnions.PrimaryBlock value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for rotatingRatio
    /// </summary>
    [Serializable]
    public struct RotatingRatio
    {
        public RotatingRatio(SeedUnions.RotatingRatio value)
        {
            Value = value;
        }

        internal SeedUnions.RotatingRatio Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.RotatingRatio(SeedUnions.RotatingRatio value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for colorfulCover
    /// </summary>
    [Serializable]
    public struct ColorfulCover
    {
        public ColorfulCover(SeedUnions.ColorfulCover value)
        {
            Value = value;
        }

        internal SeedUnions.ColorfulCover Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.ColorfulCover(SeedUnions.ColorfulCover value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for disloyalValue
    /// </summary>
    [Serializable]
    public struct DisloyalValue
    {
        public DisloyalValue(SeedUnions.DisloyalValue value)
        {
            Value = value;
        }

        internal SeedUnions.DisloyalValue Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.DisloyalValue(SeedUnions.DisloyalValue value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for gruesomeCoach
    /// </summary>
    [Serializable]
    public struct GruesomeCoach
    {
        public GruesomeCoach(SeedUnions.GruesomeCoach value)
        {
            Value = value;
        }

        internal SeedUnions.GruesomeCoach Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.GruesomeCoach(SeedUnions.GruesomeCoach value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for totalWork
    /// </summary>
    [Serializable]
    public struct TotalWork
    {
        public TotalWork(SeedUnions.TotalWork value)
        {
            Value = value;
        }

        internal SeedUnions.TotalWork Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.TotalWork(SeedUnions.TotalWork value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for harmoniousPlay
    /// </summary>
    [Serializable]
    public struct HarmoniousPlay
    {
        public HarmoniousPlay(SeedUnions.HarmoniousPlay value)
        {
            Value = value;
        }

        internal SeedUnions.HarmoniousPlay Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.HarmoniousPlay(SeedUnions.HarmoniousPlay value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for uniqueStress
    /// </summary>
    [Serializable]
    public struct UniqueStress
    {
        public UniqueStress(SeedUnions.UniqueStress value)
        {
            Value = value;
        }

        internal SeedUnions.UniqueStress Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.UniqueStress(SeedUnions.UniqueStress value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for unwillingSmoke
    /// </summary>
    [Serializable]
    public struct UnwillingSmoke
    {
        public UnwillingSmoke(SeedUnions.UnwillingSmoke value)
        {
            Value = value;
        }

        internal SeedUnions.UnwillingSmoke Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.UnwillingSmoke(SeedUnions.UnwillingSmoke value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for frozenSleep
    /// </summary>
    [Serializable]
    public struct FrozenSleep
    {
        public FrozenSleep(SeedUnions.FrozenSleep value)
        {
            Value = value;
        }

        internal SeedUnions.FrozenSleep Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.FrozenSleep(SeedUnions.FrozenSleep value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for diligentDeal
    /// </summary>
    [Serializable]
    public struct DiligentDeal
    {
        public DiligentDeal(SeedUnions.DiligentDeal value)
        {
            Value = value;
        }

        internal SeedUnions.DiligentDeal Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.DiligentDeal(SeedUnions.DiligentDeal value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for attractiveScript
    /// </summary>
    [Serializable]
    public struct AttractiveScript
    {
        public AttractiveScript(SeedUnions.AttractiveScript value)
        {
            Value = value;
        }

        internal SeedUnions.AttractiveScript Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.AttractiveScript(
            SeedUnions.AttractiveScript value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for hoarseMouse
    /// </summary>
    [Serializable]
    public struct HoarseMouse
    {
        public HoarseMouse(SeedUnions.HoarseMouse value)
        {
            Value = value;
        }

        internal SeedUnions.HoarseMouse Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.HoarseMouse(SeedUnions.HoarseMouse value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for circularCard
    /// </summary>
    [Serializable]
    public struct CircularCard
    {
        public CircularCard(SeedUnions.CircularCard value)
        {
            Value = value;
        }

        internal SeedUnions.CircularCard Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.CircularCard(SeedUnions.CircularCard value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for potableBad
    /// </summary>
    [Serializable]
    public struct PotableBad
    {
        public PotableBad(SeedUnions.PotableBad value)
        {
            Value = value;
        }

        internal SeedUnions.PotableBad Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.PotableBad(SeedUnions.PotableBad value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for triangularRepair
    /// </summary>
    [Serializable]
    public struct TriangularRepair
    {
        public TriangularRepair(SeedUnions.TriangularRepair value)
        {
            Value = value;
        }

        internal SeedUnions.TriangularRepair Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.TriangularRepair(
            SeedUnions.TriangularRepair value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for gaseousRoad
    /// </summary>
    [Serializable]
    public struct GaseousRoad
    {
        public GaseousRoad(SeedUnions.GaseousRoad value)
        {
            Value = value;
        }

        internal SeedUnions.GaseousRoad Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BigUnion.GaseousRoad(SeedUnions.GaseousRoad value) =>
            new(value);
    }
}
