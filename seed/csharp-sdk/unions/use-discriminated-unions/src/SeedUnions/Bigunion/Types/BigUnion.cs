using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(BigUnion.JsonConverter))]
public record BigUnion
{
    /// <summary>
    /// Discriminator property name for serialization/deserialization
    /// </summary>
    internal const string DiscriminatorName = "type";

    /// <summary>
    /// Create an instance of BigUnion with <see cref="NormalSweet"/>.
    /// </summary>
    public BigUnion(NormalSweet value)
    {
        Type = "normalSweet";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="ThankfulFactor"/>.
    /// </summary>
    public BigUnion(ThankfulFactor value)
    {
        Type = "thankfulFactor";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="JumboEnd"/>.
    /// </summary>
    public BigUnion(JumboEnd value)
    {
        Type = "jumboEnd";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="HastyPain"/>.
    /// </summary>
    public BigUnion(HastyPain value)
    {
        Type = "hastyPain";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="MistySnow"/>.
    /// </summary>
    public BigUnion(MistySnow value)
    {
        Type = "mistySnow";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="DistinctFailure"/>.
    /// </summary>
    public BigUnion(DistinctFailure value)
    {
        Type = "distinctFailure";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="PracticalPrinciple"/>.
    /// </summary>
    public BigUnion(PracticalPrinciple value)
    {
        Type = "practicalPrinciple";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="LimpingStep"/>.
    /// </summary>
    public BigUnion(LimpingStep value)
    {
        Type = "limpingStep";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="VibrantExcitement"/>.
    /// </summary>
    public BigUnion(VibrantExcitement value)
    {
        Type = "vibrantExcitement";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="ActiveDiamond"/>.
    /// </summary>
    public BigUnion(ActiveDiamond value)
    {
        Type = "activeDiamond";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="PopularLimit"/>.
    /// </summary>
    public BigUnion(PopularLimit value)
    {
        Type = "popularLimit";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="FalseMirror"/>.
    /// </summary>
    public BigUnion(FalseMirror value)
    {
        Type = "falseMirror";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="PrimaryBlock"/>.
    /// </summary>
    public BigUnion(PrimaryBlock value)
    {
        Type = "primaryBlock";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="RotatingRatio"/>.
    /// </summary>
    public BigUnion(RotatingRatio value)
    {
        Type = "rotatingRatio";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="ColorfulCover"/>.
    /// </summary>
    public BigUnion(ColorfulCover value)
    {
        Type = "colorfulCover";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="DisloyalValue"/>.
    /// </summary>
    public BigUnion(DisloyalValue value)
    {
        Type = "disloyalValue";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="GruesomeCoach"/>.
    /// </summary>
    public BigUnion(GruesomeCoach value)
    {
        Type = "gruesomeCoach";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="TotalWork"/>.
    /// </summary>
    public BigUnion(TotalWork value)
    {
        Type = "totalWork";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="HarmoniousPlay"/>.
    /// </summary>
    public BigUnion(HarmoniousPlay value)
    {
        Type = "harmoniousPlay";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="UniqueStress"/>.
    /// </summary>
    public BigUnion(UniqueStress value)
    {
        Type = "uniqueStress";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="UnwillingSmoke"/>.
    /// </summary>
    public BigUnion(UnwillingSmoke value)
    {
        Type = "unwillingSmoke";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="FrozenSleep"/>.
    /// </summary>
    public BigUnion(FrozenSleep value)
    {
        Type = "frozenSleep";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="DiligentDeal"/>.
    /// </summary>
    public BigUnion(DiligentDeal value)
    {
        Type = "diligentDeal";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="AttractiveScript"/>.
    /// </summary>
    public BigUnion(AttractiveScript value)
    {
        Type = "attractiveScript";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="HoarseMouse"/>.
    /// </summary>
    public BigUnion(HoarseMouse value)
    {
        Type = "hoarseMouse";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="CircularCard"/>.
    /// </summary>
    public BigUnion(CircularCard value)
    {
        Type = "circularCard";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="PotableBad"/>.
    /// </summary>
    public BigUnion(PotableBad value)
    {
        Type = "potableBad";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="TriangularRepair"/>.
    /// </summary>
    public BigUnion(TriangularRepair value)
    {
        Type = "triangularRepair";
        Value = value;
    }

    /// <summary>
    /// Create an instance of BigUnion with <see cref="GaseousRoad"/>.
    /// </summary>
    public BigUnion(GaseousRoad value)
    {
        Type = "gaseousRoad";
        Value = value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    [JsonPropertyName("type")]
    public string Type { get; internal set; }

    /// <summary>
    /// Discriminated union value
    /// </summary>
    [JsonIgnore]
    public object Value { get; internal set; }

    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("created-at")]
    public required DateTime CreatedAt { get; set; }

    [JsonPropertyName("archived-at")]
    public DateTime? ArchivedAt { get; set; }

    /// <summary>
    /// Returns true if of type <see cref="NormalSweet"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsNormalSweet => Type == "normalSweet";

    /// <summary>
    /// Returns true if of type <see cref="ThankfulFactor"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsThankfulFactor => Type == "thankfulFactor";

    /// <summary>
    /// Returns true if of type <see cref="JumboEnd"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsJumboEnd => Type == "jumboEnd";

    /// <summary>
    /// Returns true if of type <see cref="HastyPain"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsHastyPain => Type == "hastyPain";

    /// <summary>
    /// Returns true if of type <see cref="MistySnow"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsMistySnow => Type == "mistySnow";

    /// <summary>
    /// Returns true if of type <see cref="DistinctFailure"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsDistinctFailure => Type == "distinctFailure";

    /// <summary>
    /// Returns true if of type <see cref="PracticalPrinciple"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsPracticalPrinciple => Type == "practicalPrinciple";

    /// <summary>
    /// Returns true if of type <see cref="LimpingStep"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsLimpingStep => Type == "limpingStep";

    /// <summary>
    /// Returns true if of type <see cref="VibrantExcitement"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsVibrantExcitement => Type == "vibrantExcitement";

    /// <summary>
    /// Returns true if of type <see cref="ActiveDiamond"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsActiveDiamond => Type == "activeDiamond";

    /// <summary>
    /// Returns true if of type <see cref="PopularLimit"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsPopularLimit => Type == "popularLimit";

    /// <summary>
    /// Returns true if of type <see cref="FalseMirror"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsFalseMirror => Type == "falseMirror";

    /// <summary>
    /// Returns true if of type <see cref="PrimaryBlock"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsPrimaryBlock => Type == "primaryBlock";

    /// <summary>
    /// Returns true if of type <see cref="RotatingRatio"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsRotatingRatio => Type == "rotatingRatio";

    /// <summary>
    /// Returns true if of type <see cref="ColorfulCover"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsColorfulCover => Type == "colorfulCover";

    /// <summary>
    /// Returns true if of type <see cref="DisloyalValue"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsDisloyalValue => Type == "disloyalValue";

    /// <summary>
    /// Returns true if of type <see cref="GruesomeCoach"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsGruesomeCoach => Type == "gruesomeCoach";

    /// <summary>
    /// Returns true if of type <see cref="TotalWork"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsTotalWork => Type == "totalWork";

    /// <summary>
    /// Returns true if of type <see cref="HarmoniousPlay"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsHarmoniousPlay => Type == "harmoniousPlay";

    /// <summary>
    /// Returns true if of type <see cref="UniqueStress"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsUniqueStress => Type == "uniqueStress";

    /// <summary>
    /// Returns true if of type <see cref="UnwillingSmoke"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsUnwillingSmoke => Type == "unwillingSmoke";

    /// <summary>
    /// Returns true if of type <see cref="FrozenSleep"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsFrozenSleep => Type == "frozenSleep";

    /// <summary>
    /// Returns true if of type <see cref="DiligentDeal"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsDiligentDeal => Type == "diligentDeal";

    /// <summary>
    /// Returns true if of type <see cref="AttractiveScript"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsAttractiveScript => Type == "attractiveScript";

    /// <summary>
    /// Returns true if of type <see cref="HoarseMouse"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsHoarseMouse => Type == "hoarseMouse";

    /// <summary>
    /// Returns true if of type <see cref="CircularCard"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsCircularCard => Type == "circularCard";

    /// <summary>
    /// Returns true if of type <see cref="PotableBad"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsPotableBad => Type == "potableBad";

    /// <summary>
    /// Returns true if of type <see cref="TriangularRepair"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsTriangularRepair => Type == "triangularRepair";

    /// <summary>
    /// Returns true if of type <see cref="GaseousRoad"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsGaseousRoad => Type == "gaseousRoad";

    /// <summary>
    /// Returns the value as a <see cref="NormalSweet"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="NormalSweet"/>.</exception>
    public NormalSweet AsNormalSweet() => (NormalSweet)Value;

    /// <summary>
    /// Returns the value as a <see cref="ThankfulFactor"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="ThankfulFactor"/>.</exception>
    public ThankfulFactor AsThankfulFactor() => (ThankfulFactor)Value;

    /// <summary>
    /// Returns the value as a <see cref="JumboEnd"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="JumboEnd"/>.</exception>
    public JumboEnd AsJumboEnd() => (JumboEnd)Value;

    /// <summary>
    /// Returns the value as a <see cref="HastyPain"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="HastyPain"/>.</exception>
    public HastyPain AsHastyPain() => (HastyPain)Value;

    /// <summary>
    /// Returns the value as a <see cref="MistySnow"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="MistySnow"/>.</exception>
    public MistySnow AsMistySnow() => (MistySnow)Value;

    /// <summary>
    /// Returns the value as a <see cref="DistinctFailure"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="DistinctFailure"/>.</exception>
    public DistinctFailure AsDistinctFailure() => (DistinctFailure)Value;

    /// <summary>
    /// Returns the value as a <see cref="PracticalPrinciple"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="PracticalPrinciple"/>.</exception>
    public PracticalPrinciple AsPracticalPrinciple() => (PracticalPrinciple)Value;

    /// <summary>
    /// Returns the value as a <see cref="LimpingStep"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="LimpingStep"/>.</exception>
    public LimpingStep AsLimpingStep() => (LimpingStep)Value;

    /// <summary>
    /// Returns the value as a <see cref="VibrantExcitement"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="VibrantExcitement"/>.</exception>
    public VibrantExcitement AsVibrantExcitement() => (VibrantExcitement)Value;

    /// <summary>
    /// Returns the value as a <see cref="ActiveDiamond"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="ActiveDiamond"/>.</exception>
    public ActiveDiamond AsActiveDiamond() => (ActiveDiamond)Value;

    /// <summary>
    /// Returns the value as a <see cref="PopularLimit"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="PopularLimit"/>.</exception>
    public PopularLimit AsPopularLimit() => (PopularLimit)Value;

    /// <summary>
    /// Returns the value as a <see cref="FalseMirror"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="FalseMirror"/>.</exception>
    public FalseMirror AsFalseMirror() => (FalseMirror)Value;

    /// <summary>
    /// Returns the value as a <see cref="PrimaryBlock"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="PrimaryBlock"/>.</exception>
    public PrimaryBlock AsPrimaryBlock() => (PrimaryBlock)Value;

    /// <summary>
    /// Returns the value as a <see cref="RotatingRatio"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="RotatingRatio"/>.</exception>
    public RotatingRatio AsRotatingRatio() => (RotatingRatio)Value;

    /// <summary>
    /// Returns the value as a <see cref="ColorfulCover"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="ColorfulCover"/>.</exception>
    public ColorfulCover AsColorfulCover() => (ColorfulCover)Value;

    /// <summary>
    /// Returns the value as a <see cref="DisloyalValue"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="DisloyalValue"/>.</exception>
    public DisloyalValue AsDisloyalValue() => (DisloyalValue)Value;

    /// <summary>
    /// Returns the value as a <see cref="GruesomeCoach"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="GruesomeCoach"/>.</exception>
    public GruesomeCoach AsGruesomeCoach() => (GruesomeCoach)Value;

    /// <summary>
    /// Returns the value as a <see cref="TotalWork"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="TotalWork"/>.</exception>
    public TotalWork AsTotalWork() => (TotalWork)Value;

    /// <summary>
    /// Returns the value as a <see cref="HarmoniousPlay"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="HarmoniousPlay"/>.</exception>
    public HarmoniousPlay AsHarmoniousPlay() => (HarmoniousPlay)Value;

    /// <summary>
    /// Returns the value as a <see cref="UniqueStress"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="UniqueStress"/>.</exception>
    public UniqueStress AsUniqueStress() => (UniqueStress)Value;

    /// <summary>
    /// Returns the value as a <see cref="UnwillingSmoke"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="UnwillingSmoke"/>.</exception>
    public UnwillingSmoke AsUnwillingSmoke() => (UnwillingSmoke)Value;

    /// <summary>
    /// Returns the value as a <see cref="FrozenSleep"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="FrozenSleep"/>.</exception>
    public FrozenSleep AsFrozenSleep() => (FrozenSleep)Value;

    /// <summary>
    /// Returns the value as a <see cref="DiligentDeal"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="DiligentDeal"/>.</exception>
    public DiligentDeal AsDiligentDeal() => (DiligentDeal)Value;

    /// <summary>
    /// Returns the value as a <see cref="AttractiveScript"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="AttractiveScript"/>.</exception>
    public AttractiveScript AsAttractiveScript() => (AttractiveScript)Value;

    /// <summary>
    /// Returns the value as a <see cref="HoarseMouse"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="HoarseMouse"/>.</exception>
    public HoarseMouse AsHoarseMouse() => (HoarseMouse)Value;

    /// <summary>
    /// Returns the value as a <see cref="CircularCard"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="CircularCard"/>.</exception>
    public CircularCard AsCircularCard() => (CircularCard)Value;

    /// <summary>
    /// Returns the value as a <see cref="PotableBad"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="PotableBad"/>.</exception>
    public PotableBad AsPotableBad() => (PotableBad)Value;

    /// <summary>
    /// Returns the value as a <see cref="TriangularRepair"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="TriangularRepair"/>.</exception>
    public TriangularRepair AsTriangularRepair() => (TriangularRepair)Value;

    /// <summary>
    /// Returns the value as a <see cref="GaseousRoad"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="GaseousRoad"/>.</exception>
    public GaseousRoad AsGaseousRoad() => (GaseousRoad)Value;

    public T Match<T>(
        Func<NormalSweet, T> onNormalSweet,
        Func<ThankfulFactor, T> onThankfulFactor,
        Func<JumboEnd, T> onJumboEnd,
        Func<HastyPain, T> onHastyPain,
        Func<MistySnow, T> onMistySnow,
        Func<DistinctFailure, T> onDistinctFailure,
        Func<PracticalPrinciple, T> onPracticalPrinciple,
        Func<LimpingStep, T> onLimpingStep,
        Func<VibrantExcitement, T> onVibrantExcitement,
        Func<ActiveDiamond, T> onActiveDiamond,
        Func<PopularLimit, T> onPopularLimit,
        Func<FalseMirror, T> onFalseMirror,
        Func<PrimaryBlock, T> onPrimaryBlock,
        Func<RotatingRatio, T> onRotatingRatio,
        Func<ColorfulCover, T> onColorfulCover,
        Func<DisloyalValue, T> onDisloyalValue,
        Func<GruesomeCoach, T> onGruesomeCoach,
        Func<TotalWork, T> onTotalWork,
        Func<HarmoniousPlay, T> onHarmoniousPlay,
        Func<UniqueStress, T> onUniqueStress,
        Func<UnwillingSmoke, T> onUnwillingSmoke,
        Func<FrozenSleep, T> onFrozenSleep,
        Func<DiligentDeal, T> onDiligentDeal,
        Func<AttractiveScript, T> onAttractiveScript,
        Func<HoarseMouse, T> onHoarseMouse,
        Func<CircularCard, T> onCircularCard,
        Func<PotableBad, T> onPotableBad,
        Func<TriangularRepair, T> onTriangularRepair,
        Func<GaseousRoad, T> onGaseousRoad
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
            _ => throw new Exception($"Unexpected Type: {Type}"),
        };
    }

    public void Visit(
        Action<NormalSweet> onNormalSweet,
        Action<ThankfulFactor> onThankfulFactor,
        Action<JumboEnd> onJumboEnd,
        Action<HastyPain> onHastyPain,
        Action<MistySnow> onMistySnow,
        Action<DistinctFailure> onDistinctFailure,
        Action<PracticalPrinciple> onPracticalPrinciple,
        Action<LimpingStep> onLimpingStep,
        Action<VibrantExcitement> onVibrantExcitement,
        Action<ActiveDiamond> onActiveDiamond,
        Action<PopularLimit> onPopularLimit,
        Action<FalseMirror> onFalseMirror,
        Action<PrimaryBlock> onPrimaryBlock,
        Action<RotatingRatio> onRotatingRatio,
        Action<ColorfulCover> onColorfulCover,
        Action<DisloyalValue> onDisloyalValue,
        Action<GruesomeCoach> onGruesomeCoach,
        Action<TotalWork> onTotalWork,
        Action<HarmoniousPlay> onHarmoniousPlay,
        Action<UniqueStress> onUniqueStress,
        Action<UnwillingSmoke> onUnwillingSmoke,
        Action<FrozenSleep> onFrozenSleep,
        Action<DiligentDeal> onDiligentDeal,
        Action<AttractiveScript> onAttractiveScript,
        Action<HoarseMouse> onHoarseMouse,
        Action<CircularCard> onCircularCard,
        Action<PotableBad> onPotableBad,
        Action<TriangularRepair> onTriangularRepair,
        Action<GaseousRoad> onGaseousRoad
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
                throw new Exception($"Unexpected Type: {Type}");
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="NormalSweet"/> and returns true if successful.
    /// </summary>
    public bool TryAsNormalSweet(out NormalSweet? value)
    {
        if (Value is NormalSweet asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="ThankfulFactor"/> and returns true if successful.
    /// </summary>
    public bool TryAsThankfulFactor(out ThankfulFactor? value)
    {
        if (Value is ThankfulFactor asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="JumboEnd"/> and returns true if successful.
    /// </summary>
    public bool TryAsJumboEnd(out JumboEnd? value)
    {
        if (Value is JumboEnd asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="HastyPain"/> and returns true if successful.
    /// </summary>
    public bool TryAsHastyPain(out HastyPain? value)
    {
        if (Value is HastyPain asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="MistySnow"/> and returns true if successful.
    /// </summary>
    public bool TryAsMistySnow(out MistySnow? value)
    {
        if (Value is MistySnow asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="DistinctFailure"/> and returns true if successful.
    /// </summary>
    public bool TryAsDistinctFailure(out DistinctFailure? value)
    {
        if (Value is DistinctFailure asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="PracticalPrinciple"/> and returns true if successful.
    /// </summary>
    public bool TryAsPracticalPrinciple(out PracticalPrinciple? value)
    {
        if (Value is PracticalPrinciple asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="LimpingStep"/> and returns true if successful.
    /// </summary>
    public bool TryAsLimpingStep(out LimpingStep? value)
    {
        if (Value is LimpingStep asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="VibrantExcitement"/> and returns true if successful.
    /// </summary>
    public bool TryAsVibrantExcitement(out VibrantExcitement? value)
    {
        if (Value is VibrantExcitement asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="ActiveDiamond"/> and returns true if successful.
    /// </summary>
    public bool TryAsActiveDiamond(out ActiveDiamond? value)
    {
        if (Value is ActiveDiamond asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="PopularLimit"/> and returns true if successful.
    /// </summary>
    public bool TryAsPopularLimit(out PopularLimit? value)
    {
        if (Value is PopularLimit asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="FalseMirror"/> and returns true if successful.
    /// </summary>
    public bool TryAsFalseMirror(out FalseMirror? value)
    {
        if (Value is FalseMirror asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="PrimaryBlock"/> and returns true if successful.
    /// </summary>
    public bool TryAsPrimaryBlock(out PrimaryBlock? value)
    {
        if (Value is PrimaryBlock asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="RotatingRatio"/> and returns true if successful.
    /// </summary>
    public bool TryAsRotatingRatio(out RotatingRatio? value)
    {
        if (Value is RotatingRatio asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="ColorfulCover"/> and returns true if successful.
    /// </summary>
    public bool TryAsColorfulCover(out ColorfulCover? value)
    {
        if (Value is ColorfulCover asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="DisloyalValue"/> and returns true if successful.
    /// </summary>
    public bool TryAsDisloyalValue(out DisloyalValue? value)
    {
        if (Value is DisloyalValue asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="GruesomeCoach"/> and returns true if successful.
    /// </summary>
    public bool TryAsGruesomeCoach(out GruesomeCoach? value)
    {
        if (Value is GruesomeCoach asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="TotalWork"/> and returns true if successful.
    /// </summary>
    public bool TryAsTotalWork(out TotalWork? value)
    {
        if (Value is TotalWork asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="HarmoniousPlay"/> and returns true if successful.
    /// </summary>
    public bool TryAsHarmoniousPlay(out HarmoniousPlay? value)
    {
        if (Value is HarmoniousPlay asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="UniqueStress"/> and returns true if successful.
    /// </summary>
    public bool TryAsUniqueStress(out UniqueStress? value)
    {
        if (Value is UniqueStress asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="UnwillingSmoke"/> and returns true if successful.
    /// </summary>
    public bool TryAsUnwillingSmoke(out UnwillingSmoke? value)
    {
        if (Value is UnwillingSmoke asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="FrozenSleep"/> and returns true if successful.
    /// </summary>
    public bool TryAsFrozenSleep(out FrozenSleep? value)
    {
        if (Value is FrozenSleep asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="DiligentDeal"/> and returns true if successful.
    /// </summary>
    public bool TryAsDiligentDeal(out DiligentDeal? value)
    {
        if (Value is DiligentDeal asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="AttractiveScript"/> and returns true if successful.
    /// </summary>
    public bool TryAsAttractiveScript(out AttractiveScript? value)
    {
        if (Value is AttractiveScript asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="HoarseMouse"/> and returns true if successful.
    /// </summary>
    public bool TryAsHoarseMouse(out HoarseMouse? value)
    {
        if (Value is HoarseMouse asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="CircularCard"/> and returns true if successful.
    /// </summary>
    public bool TryAsCircularCard(out CircularCard? value)
    {
        if (Value is CircularCard asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="PotableBad"/> and returns true if successful.
    /// </summary>
    public bool TryAsPotableBad(out PotableBad? value)
    {
        if (Value is PotableBad asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="TriangularRepair"/> and returns true if successful.
    /// </summary>
    public bool TryAsTriangularRepair(out TriangularRepair? value)
    {
        if (Value is TriangularRepair asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="GaseousRoad"/> and returns true if successful.
    /// </summary>
    public bool TryAsGaseousRoad(out GaseousRoad? value)
    {
        if (Value is GaseousRoad asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

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
            var jsonObject = JsonElement.ParseValue(ref reader);
            if (!jsonObject.TryGetProperty("type", out var discriminatorElement))
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

            switch (discriminator)
            {
                case "normalSweet":
                {
                    var value = jsonObject.Deserialize<NormalSweet>();
                    return new BigUnion(value);
                }
                case "thankfulFactor":
                {
                    var value = jsonObject.Deserialize<ThankfulFactor>();
                    return new BigUnion(value);
                }
                case "jumboEnd":
                {
                    var value = jsonObject.Deserialize<JumboEnd>();
                    return new BigUnion(value);
                }
                case "hastyPain":
                {
                    var value = jsonObject.Deserialize<HastyPain>();
                    return new BigUnion(value);
                }
                case "mistySnow":
                {
                    var value = jsonObject.Deserialize<MistySnow>();
                    return new BigUnion(value);
                }
                case "distinctFailure":
                {
                    var value = jsonObject.Deserialize<DistinctFailure>();
                    return new BigUnion(value);
                }
                case "practicalPrinciple":
                {
                    var value = jsonObject.Deserialize<PracticalPrinciple>();
                    return new BigUnion(value);
                }
                case "limpingStep":
                {
                    var value = jsonObject.Deserialize<LimpingStep>();
                    return new BigUnion(value);
                }
                case "vibrantExcitement":
                {
                    var value = jsonObject.Deserialize<VibrantExcitement>();
                    return new BigUnion(value);
                }
                case "activeDiamond":
                {
                    var value = jsonObject.Deserialize<ActiveDiamond>();
                    return new BigUnion(value);
                }
                case "popularLimit":
                {
                    var value = jsonObject.Deserialize<PopularLimit>();
                    return new BigUnion(value);
                }
                case "falseMirror":
                {
                    var value = jsonObject.Deserialize<FalseMirror>();
                    return new BigUnion(value);
                }
                case "primaryBlock":
                {
                    var value = jsonObject.Deserialize<PrimaryBlock>();
                    return new BigUnion(value);
                }
                case "rotatingRatio":
                {
                    var value = jsonObject.Deserialize<RotatingRatio>();
                    return new BigUnion(value);
                }
                case "colorfulCover":
                {
                    var value = jsonObject.Deserialize<ColorfulCover>();
                    return new BigUnion(value);
                }
                case "disloyalValue":
                {
                    var value = jsonObject.Deserialize<DisloyalValue>();
                    return new BigUnion(value);
                }
                case "gruesomeCoach":
                {
                    var value = jsonObject.Deserialize<GruesomeCoach>();
                    return new BigUnion(value);
                }
                case "totalWork":
                {
                    var value = jsonObject.Deserialize<TotalWork>();
                    return new BigUnion(value);
                }
                case "harmoniousPlay":
                {
                    var value = jsonObject.Deserialize<HarmoniousPlay>();
                    return new BigUnion(value);
                }
                case "uniqueStress":
                {
                    var value = jsonObject.Deserialize<UniqueStress>();
                    return new BigUnion(value);
                }
                case "unwillingSmoke":
                {
                    var value = jsonObject.Deserialize<UnwillingSmoke>();
                    return new BigUnion(value);
                }
                case "frozenSleep":
                {
                    var value = jsonObject.Deserialize<FrozenSleep>();
                    return new BigUnion(value);
                }
                case "diligentDeal":
                {
                    var value = jsonObject.Deserialize<DiligentDeal>();
                    return new BigUnion(value);
                }
                case "attractiveScript":
                {
                    var value = jsonObject.Deserialize<AttractiveScript>();
                    return new BigUnion(value);
                }
                case "hoarseMouse":
                {
                    var value = jsonObject.Deserialize<HoarseMouse>();
                    return new BigUnion(value);
                }
                case "circularCard":
                {
                    var value = jsonObject.Deserialize<CircularCard>();
                    return new BigUnion(value);
                }
                case "potableBad":
                {
                    var value = jsonObject.Deserialize<PotableBad>();
                    return new BigUnion(value);
                }
                case "triangularRepair":
                {
                    var value = jsonObject.Deserialize<TriangularRepair>();
                    return new BigUnion(value);
                }
                case "gaseousRoad":
                {
                    var value = jsonObject.Deserialize<GaseousRoad>();
                    return new BigUnion(value);
                }
                default:
                    throw new JsonException(
                        $"Discriminator property 'type' is unexpected value '{discriminator}'"
                    );
            }
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigUnion value,
            JsonSerializerOptions options
        )
        {
            var jsonNode = JsonSerializer.SerializeToNode(value.Value, options);
            if (jsonNode == null)
            {
                throw new JsonException("Failed to serialize BigUnion");
            }

            jsonNode.WriteTo(writer, options);
        }
    }
}
