<?php

namespace Seed\Bigunion\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use DateTime;
use Seed\Core\Types\Date;
use Exception;
use Seed\Core\Json\JsonDecoder;

class BigUnion extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var DateTime $createdAt
     */
    #[JsonProperty('created-at'), Date(Date::TYPE_DATETIME)]
    public DateTime $createdAt;

    /**
     * @var ?DateTime $archivedAt
     */
    #[JsonProperty('archived-at'), Date(Date::TYPE_DATETIME)]
    public ?DateTime $archivedAt;

    /**
     * @var (
     *    'normalSweet'
     *   |'thankfulFactor'
     *   |'jumboEnd'
     *   |'hastyPain'
     *   |'mistySnow'
     *   |'distinctFailure'
     *   |'practicalPrinciple'
     *   |'limpingStep'
     *   |'vibrantExcitement'
     *   |'activeDiamond'
     *   |'popularLimit'
     *   |'falseMirror'
     *   |'primaryBlock'
     *   |'rotatingRatio'
     *   |'colorfulCover'
     *   |'disloyalValue'
     *   |'gruesomeCoach'
     *   |'totalWork'
     *   |'harmoniousPlay'
     *   |'uniqueStress'
     *   |'unwillingSmoke'
     *   |'frozenSleep'
     *   |'diligentDeal'
     *   |'attractiveScript'
     *   |'hoarseMouse'
     *   |'circularCard'
     *   |'potableBad'
     *   |'triangularRepair'
     *   |'gaseousRoad'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    NormalSweet
     *   |ThankfulFactor
     *   |JumboEnd
     *   |HastyPain
     *   |MistySnow
     *   |DistinctFailure
     *   |PracticalPrinciple
     *   |LimpingStep
     *   |VibrantExcitement
     *   |ActiveDiamond
     *   |PopularLimit
     *   |FalseMirror
     *   |PrimaryBlock
     *   |RotatingRatio
     *   |ColorfulCover
     *   |DisloyalValue
     *   |GruesomeCoach
     *   |TotalWork
     *   |HarmoniousPlay
     *   |UniqueStress
     *   |UnwillingSmoke
     *   |FrozenSleep
     *   |DiligentDeal
     *   |AttractiveScript
     *   |HoarseMouse
     *   |CircularCard
     *   |PotableBad
     *   |TriangularRepair
     *   |GaseousRoad
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   id: string,
     *   createdAt: DateTime,
     *   type: (
     *    'normalSweet'
     *   |'thankfulFactor'
     *   |'jumboEnd'
     *   |'hastyPain'
     *   |'mistySnow'
     *   |'distinctFailure'
     *   |'practicalPrinciple'
     *   |'limpingStep'
     *   |'vibrantExcitement'
     *   |'activeDiamond'
     *   |'popularLimit'
     *   |'falseMirror'
     *   |'primaryBlock'
     *   |'rotatingRatio'
     *   |'colorfulCover'
     *   |'disloyalValue'
     *   |'gruesomeCoach'
     *   |'totalWork'
     *   |'harmoniousPlay'
     *   |'uniqueStress'
     *   |'unwillingSmoke'
     *   |'frozenSleep'
     *   |'diligentDeal'
     *   |'attractiveScript'
     *   |'hoarseMouse'
     *   |'circularCard'
     *   |'potableBad'
     *   |'triangularRepair'
     *   |'gaseousRoad'
     *   |'_unknown'
     * ),
     *   value: (
     *    NormalSweet
     *   |ThankfulFactor
     *   |JumboEnd
     *   |HastyPain
     *   |MistySnow
     *   |DistinctFailure
     *   |PracticalPrinciple
     *   |LimpingStep
     *   |VibrantExcitement
     *   |ActiveDiamond
     *   |PopularLimit
     *   |FalseMirror
     *   |PrimaryBlock
     *   |RotatingRatio
     *   |ColorfulCover
     *   |DisloyalValue
     *   |GruesomeCoach
     *   |TotalWork
     *   |HarmoniousPlay
     *   |UniqueStress
     *   |UnwillingSmoke
     *   |FrozenSleep
     *   |DiligentDeal
     *   |AttractiveScript
     *   |HoarseMouse
     *   |CircularCard
     *   |PotableBad
     *   |TriangularRepair
     *   |GaseousRoad
     *   |mixed
     * ),
     *   archivedAt?: ?DateTime,
     * } $values
     */
    private function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->createdAt = $values['createdAt'];$this->archivedAt = $values['archivedAt'] ?? null;$this->type = $values['type'];$this->value = $values['value'];
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param NormalSweet $normalSweet
     * @return BigUnion
     */
    public static function normalSweet(string $id, DateTime $createdAt, NormalSweet $normalSweet, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'normalSweet',
            'value' => $normalSweet,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param ThankfulFactor $thankfulFactor
     * @return BigUnion
     */
    public static function thankfulFactor(string $id, DateTime $createdAt, ThankfulFactor $thankfulFactor, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'thankfulFactor',
            'value' => $thankfulFactor,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param JumboEnd $jumboEnd
     * @return BigUnion
     */
    public static function jumboEnd(string $id, DateTime $createdAt, JumboEnd $jumboEnd, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'jumboEnd',
            'value' => $jumboEnd,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param HastyPain $hastyPain
     * @return BigUnion
     */
    public static function hastyPain(string $id, DateTime $createdAt, HastyPain $hastyPain, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'hastyPain',
            'value' => $hastyPain,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param MistySnow $mistySnow
     * @return BigUnion
     */
    public static function mistySnow(string $id, DateTime $createdAt, MistySnow $mistySnow, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'mistySnow',
            'value' => $mistySnow,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param DistinctFailure $distinctFailure
     * @return BigUnion
     */
    public static function distinctFailure(string $id, DateTime $createdAt, DistinctFailure $distinctFailure, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'distinctFailure',
            'value' => $distinctFailure,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param PracticalPrinciple $practicalPrinciple
     * @return BigUnion
     */
    public static function practicalPrinciple(string $id, DateTime $createdAt, PracticalPrinciple $practicalPrinciple, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'practicalPrinciple',
            'value' => $practicalPrinciple,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param LimpingStep $limpingStep
     * @return BigUnion
     */
    public static function limpingStep(string $id, DateTime $createdAt, LimpingStep $limpingStep, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'limpingStep',
            'value' => $limpingStep,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param VibrantExcitement $vibrantExcitement
     * @return BigUnion
     */
    public static function vibrantExcitement(string $id, DateTime $createdAt, VibrantExcitement $vibrantExcitement, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'vibrantExcitement',
            'value' => $vibrantExcitement,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param ActiveDiamond $activeDiamond
     * @return BigUnion
     */
    public static function activeDiamond(string $id, DateTime $createdAt, ActiveDiamond $activeDiamond, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'activeDiamond',
            'value' => $activeDiamond,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param PopularLimit $popularLimit
     * @return BigUnion
     */
    public static function popularLimit(string $id, DateTime $createdAt, PopularLimit $popularLimit, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'popularLimit',
            'value' => $popularLimit,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param FalseMirror $falseMirror
     * @return BigUnion
     */
    public static function falseMirror(string $id, DateTime $createdAt, FalseMirror $falseMirror, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'falseMirror',
            'value' => $falseMirror,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param PrimaryBlock $primaryBlock
     * @return BigUnion
     */
    public static function primaryBlock(string $id, DateTime $createdAt, PrimaryBlock $primaryBlock, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'primaryBlock',
            'value' => $primaryBlock,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param RotatingRatio $rotatingRatio
     * @return BigUnion
     */
    public static function rotatingRatio(string $id, DateTime $createdAt, RotatingRatio $rotatingRatio, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'rotatingRatio',
            'value' => $rotatingRatio,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param ColorfulCover $colorfulCover
     * @return BigUnion
     */
    public static function colorfulCover(string $id, DateTime $createdAt, ColorfulCover $colorfulCover, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'colorfulCover',
            'value' => $colorfulCover,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param DisloyalValue $disloyalValue
     * @return BigUnion
     */
    public static function disloyalValue(string $id, DateTime $createdAt, DisloyalValue $disloyalValue, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'disloyalValue',
            'value' => $disloyalValue,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param GruesomeCoach $gruesomeCoach
     * @return BigUnion
     */
    public static function gruesomeCoach(string $id, DateTime $createdAt, GruesomeCoach $gruesomeCoach, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'gruesomeCoach',
            'value' => $gruesomeCoach,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param TotalWork $totalWork
     * @return BigUnion
     */
    public static function totalWork(string $id, DateTime $createdAt, TotalWork $totalWork, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'totalWork',
            'value' => $totalWork,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param HarmoniousPlay $harmoniousPlay
     * @return BigUnion
     */
    public static function harmoniousPlay(string $id, DateTime $createdAt, HarmoniousPlay $harmoniousPlay, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'harmoniousPlay',
            'value' => $harmoniousPlay,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param UniqueStress $uniqueStress
     * @return BigUnion
     */
    public static function uniqueStress(string $id, DateTime $createdAt, UniqueStress $uniqueStress, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'uniqueStress',
            'value' => $uniqueStress,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param UnwillingSmoke $unwillingSmoke
     * @return BigUnion
     */
    public static function unwillingSmoke(string $id, DateTime $createdAt, UnwillingSmoke $unwillingSmoke, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'unwillingSmoke',
            'value' => $unwillingSmoke,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param FrozenSleep $frozenSleep
     * @return BigUnion
     */
    public static function frozenSleep(string $id, DateTime $createdAt, FrozenSleep $frozenSleep, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'frozenSleep',
            'value' => $frozenSleep,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param DiligentDeal $diligentDeal
     * @return BigUnion
     */
    public static function diligentDeal(string $id, DateTime $createdAt, DiligentDeal $diligentDeal, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'diligentDeal',
            'value' => $diligentDeal,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param AttractiveScript $attractiveScript
     * @return BigUnion
     */
    public static function attractiveScript(string $id, DateTime $createdAt, AttractiveScript $attractiveScript, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'attractiveScript',
            'value' => $attractiveScript,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param HoarseMouse $hoarseMouse
     * @return BigUnion
     */
    public static function hoarseMouse(string $id, DateTime $createdAt, HoarseMouse $hoarseMouse, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'hoarseMouse',
            'value' => $hoarseMouse,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param CircularCard $circularCard
     * @return BigUnion
     */
    public static function circularCard(string $id, DateTime $createdAt, CircularCard $circularCard, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'circularCard',
            'value' => $circularCard,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param PotableBad $potableBad
     * @return BigUnion
     */
    public static function potableBad(string $id, DateTime $createdAt, PotableBad $potableBad, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'potableBad',
            'value' => $potableBad,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param TriangularRepair $triangularRepair
     * @return BigUnion
     */
    public static function triangularRepair(string $id, DateTime $createdAt, TriangularRepair $triangularRepair, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'triangularRepair',
            'value' => $triangularRepair,
        ]);
    }

    /**
     * @param string $id
     * @param DateTime $createdAt
     * @param ?DateTime $archivedAt
     * @param GaseousRoad $gaseousRoad
     * @return BigUnion
     */
    public static function gaseousRoad(string $id, DateTime $createdAt, GaseousRoad $gaseousRoad, ?DateTime $archivedAt = null): BigUnion {
        return new BigUnion([
            'id' => $id,
            'createdAt' => $createdAt,
            'archivedAt' => $archivedAt,
            'type' => 'gaseousRoad',
            'value' => $gaseousRoad,
        ]);
    }

    /**
     * @return bool
     */
    public function isNormalSweet(): bool {
        return $this->value instanceof NormalSweet&& $this->type === 'normalSweet';
    }

    /**
     * @return NormalSweet
     */
    public function asNormalSweet(): NormalSweet {
        if (!($this->value instanceof NormalSweet&& $this->type === 'normalSweet')){
            throw new Exception(
                "Expected normalSweet; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isThankfulFactor(): bool {
        return $this->value instanceof ThankfulFactor&& $this->type === 'thankfulFactor';
    }

    /**
     * @return ThankfulFactor
     */
    public function asThankfulFactor(): ThankfulFactor {
        if (!($this->value instanceof ThankfulFactor&& $this->type === 'thankfulFactor')){
            throw new Exception(
                "Expected thankfulFactor; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isJumboEnd(): bool {
        return $this->value instanceof JumboEnd&& $this->type === 'jumboEnd';
    }

    /**
     * @return JumboEnd
     */
    public function asJumboEnd(): JumboEnd {
        if (!($this->value instanceof JumboEnd&& $this->type === 'jumboEnd')){
            throw new Exception(
                "Expected jumboEnd; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isHastyPain(): bool {
        return $this->value instanceof HastyPain&& $this->type === 'hastyPain';
    }

    /**
     * @return HastyPain
     */
    public function asHastyPain(): HastyPain {
        if (!($this->value instanceof HastyPain&& $this->type === 'hastyPain')){
            throw new Exception(
                "Expected hastyPain; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isMistySnow(): bool {
        return $this->value instanceof MistySnow&& $this->type === 'mistySnow';
    }

    /**
     * @return MistySnow
     */
    public function asMistySnow(): MistySnow {
        if (!($this->value instanceof MistySnow&& $this->type === 'mistySnow')){
            throw new Exception(
                "Expected mistySnow; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isDistinctFailure(): bool {
        return $this->value instanceof DistinctFailure&& $this->type === 'distinctFailure';
    }

    /**
     * @return DistinctFailure
     */
    public function asDistinctFailure(): DistinctFailure {
        if (!($this->value instanceof DistinctFailure&& $this->type === 'distinctFailure')){
            throw new Exception(
                "Expected distinctFailure; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isPracticalPrinciple(): bool {
        return $this->value instanceof PracticalPrinciple&& $this->type === 'practicalPrinciple';
    }

    /**
     * @return PracticalPrinciple
     */
    public function asPracticalPrinciple(): PracticalPrinciple {
        if (!($this->value instanceof PracticalPrinciple&& $this->type === 'practicalPrinciple')){
            throw new Exception(
                "Expected practicalPrinciple; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isLimpingStep(): bool {
        return $this->value instanceof LimpingStep&& $this->type === 'limpingStep';
    }

    /**
     * @return LimpingStep
     */
    public function asLimpingStep(): LimpingStep {
        if (!($this->value instanceof LimpingStep&& $this->type === 'limpingStep')){
            throw new Exception(
                "Expected limpingStep; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isVibrantExcitement(): bool {
        return $this->value instanceof VibrantExcitement&& $this->type === 'vibrantExcitement';
    }

    /**
     * @return VibrantExcitement
     */
    public function asVibrantExcitement(): VibrantExcitement {
        if (!($this->value instanceof VibrantExcitement&& $this->type === 'vibrantExcitement')){
            throw new Exception(
                "Expected vibrantExcitement; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isActiveDiamond(): bool {
        return $this->value instanceof ActiveDiamond&& $this->type === 'activeDiamond';
    }

    /**
     * @return ActiveDiamond
     */
    public function asActiveDiamond(): ActiveDiamond {
        if (!($this->value instanceof ActiveDiamond&& $this->type === 'activeDiamond')){
            throw new Exception(
                "Expected activeDiamond; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isPopularLimit(): bool {
        return $this->value instanceof PopularLimit&& $this->type === 'popularLimit';
    }

    /**
     * @return PopularLimit
     */
    public function asPopularLimit(): PopularLimit {
        if (!($this->value instanceof PopularLimit&& $this->type === 'popularLimit')){
            throw new Exception(
                "Expected popularLimit; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isFalseMirror(): bool {
        return $this->value instanceof FalseMirror&& $this->type === 'falseMirror';
    }

    /**
     * @return FalseMirror
     */
    public function asFalseMirror(): FalseMirror {
        if (!($this->value instanceof FalseMirror&& $this->type === 'falseMirror')){
            throw new Exception(
                "Expected falseMirror; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isPrimaryBlock(): bool {
        return $this->value instanceof PrimaryBlock&& $this->type === 'primaryBlock';
    }

    /**
     * @return PrimaryBlock
     */
    public function asPrimaryBlock(): PrimaryBlock {
        if (!($this->value instanceof PrimaryBlock&& $this->type === 'primaryBlock')){
            throw new Exception(
                "Expected primaryBlock; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isRotatingRatio(): bool {
        return $this->value instanceof RotatingRatio&& $this->type === 'rotatingRatio';
    }

    /**
     * @return RotatingRatio
     */
    public function asRotatingRatio(): RotatingRatio {
        if (!($this->value instanceof RotatingRatio&& $this->type === 'rotatingRatio')){
            throw new Exception(
                "Expected rotatingRatio; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isColorfulCover(): bool {
        return $this->value instanceof ColorfulCover&& $this->type === 'colorfulCover';
    }

    /**
     * @return ColorfulCover
     */
    public function asColorfulCover(): ColorfulCover {
        if (!($this->value instanceof ColorfulCover&& $this->type === 'colorfulCover')){
            throw new Exception(
                "Expected colorfulCover; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isDisloyalValue(): bool {
        return $this->value instanceof DisloyalValue&& $this->type === 'disloyalValue';
    }

    /**
     * @return DisloyalValue
     */
    public function asDisloyalValue(): DisloyalValue {
        if (!($this->value instanceof DisloyalValue&& $this->type === 'disloyalValue')){
            throw new Exception(
                "Expected disloyalValue; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isGruesomeCoach(): bool {
        return $this->value instanceof GruesomeCoach&& $this->type === 'gruesomeCoach';
    }

    /**
     * @return GruesomeCoach
     */
    public function asGruesomeCoach(): GruesomeCoach {
        if (!($this->value instanceof GruesomeCoach&& $this->type === 'gruesomeCoach')){
            throw new Exception(
                "Expected gruesomeCoach; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isTotalWork(): bool {
        return $this->value instanceof TotalWork&& $this->type === 'totalWork';
    }

    /**
     * @return TotalWork
     */
    public function asTotalWork(): TotalWork {
        if (!($this->value instanceof TotalWork&& $this->type === 'totalWork')){
            throw new Exception(
                "Expected totalWork; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isHarmoniousPlay(): bool {
        return $this->value instanceof HarmoniousPlay&& $this->type === 'harmoniousPlay';
    }

    /**
     * @return HarmoniousPlay
     */
    public function asHarmoniousPlay(): HarmoniousPlay {
        if (!($this->value instanceof HarmoniousPlay&& $this->type === 'harmoniousPlay')){
            throw new Exception(
                "Expected harmoniousPlay; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isUniqueStress(): bool {
        return $this->value instanceof UniqueStress&& $this->type === 'uniqueStress';
    }

    /**
     * @return UniqueStress
     */
    public function asUniqueStress(): UniqueStress {
        if (!($this->value instanceof UniqueStress&& $this->type === 'uniqueStress')){
            throw new Exception(
                "Expected uniqueStress; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isUnwillingSmoke(): bool {
        return $this->value instanceof UnwillingSmoke&& $this->type === 'unwillingSmoke';
    }

    /**
     * @return UnwillingSmoke
     */
    public function asUnwillingSmoke(): UnwillingSmoke {
        if (!($this->value instanceof UnwillingSmoke&& $this->type === 'unwillingSmoke')){
            throw new Exception(
                "Expected unwillingSmoke; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isFrozenSleep(): bool {
        return $this->value instanceof FrozenSleep&& $this->type === 'frozenSleep';
    }

    /**
     * @return FrozenSleep
     */
    public function asFrozenSleep(): FrozenSleep {
        if (!($this->value instanceof FrozenSleep&& $this->type === 'frozenSleep')){
            throw new Exception(
                "Expected frozenSleep; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isDiligentDeal(): bool {
        return $this->value instanceof DiligentDeal&& $this->type === 'diligentDeal';
    }

    /**
     * @return DiligentDeal
     */
    public function asDiligentDeal(): DiligentDeal {
        if (!($this->value instanceof DiligentDeal&& $this->type === 'diligentDeal')){
            throw new Exception(
                "Expected diligentDeal; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isAttractiveScript(): bool {
        return $this->value instanceof AttractiveScript&& $this->type === 'attractiveScript';
    }

    /**
     * @return AttractiveScript
     */
    public function asAttractiveScript(): AttractiveScript {
        if (!($this->value instanceof AttractiveScript&& $this->type === 'attractiveScript')){
            throw new Exception(
                "Expected attractiveScript; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isHoarseMouse(): bool {
        return $this->value instanceof HoarseMouse&& $this->type === 'hoarseMouse';
    }

    /**
     * @return HoarseMouse
     */
    public function asHoarseMouse(): HoarseMouse {
        if (!($this->value instanceof HoarseMouse&& $this->type === 'hoarseMouse')){
            throw new Exception(
                "Expected hoarseMouse; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isCircularCard(): bool {
        return $this->value instanceof CircularCard&& $this->type === 'circularCard';
    }

    /**
     * @return CircularCard
     */
    public function asCircularCard(): CircularCard {
        if (!($this->value instanceof CircularCard&& $this->type === 'circularCard')){
            throw new Exception(
                "Expected circularCard; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isPotableBad(): bool {
        return $this->value instanceof PotableBad&& $this->type === 'potableBad';
    }

    /**
     * @return PotableBad
     */
    public function asPotableBad(): PotableBad {
        if (!($this->value instanceof PotableBad&& $this->type === 'potableBad')){
            throw new Exception(
                "Expected potableBad; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isTriangularRepair(): bool {
        return $this->value instanceof TriangularRepair&& $this->type === 'triangularRepair';
    }

    /**
     * @return TriangularRepair
     */
    public function asTriangularRepair(): TriangularRepair {
        if (!($this->value instanceof TriangularRepair&& $this->type === 'triangularRepair')){
            throw new Exception(
                "Expected triangularRepair; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isGaseousRoad(): bool {
        return $this->value instanceof GaseousRoad&& $this->type === 'gaseousRoad';
    }

    /**
     * @return GaseousRoad
     */
    public function asGaseousRoad(): GaseousRoad {
        if (!($this->value instanceof GaseousRoad&& $this->type === 'gaseousRoad')){
            throw new Exception(
                "Expected gaseousRoad; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }

    /**
     * @return array<mixed>
     */
    public function jsonSerialize(): array {
        $result = [];
        $result['type'] = $this->type;
        
        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);
        
        switch ($this->type){
            case 'normalSweet':
                $value = $this->asNormalSweet()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'thankfulFactor':
                $value = $this->asThankfulFactor()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'jumboEnd':
                $value = $this->asJumboEnd()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'hastyPain':
                $value = $this->asHastyPain()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'mistySnow':
                $value = $this->asMistySnow()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'distinctFailure':
                $value = $this->asDistinctFailure()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'practicalPrinciple':
                $value = $this->asPracticalPrinciple()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'limpingStep':
                $value = $this->asLimpingStep()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'vibrantExcitement':
                $value = $this->asVibrantExcitement()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'activeDiamond':
                $value = $this->asActiveDiamond()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'popularLimit':
                $value = $this->asPopularLimit()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'falseMirror':
                $value = $this->asFalseMirror()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'primaryBlock':
                $value = $this->asPrimaryBlock()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'rotatingRatio':
                $value = $this->asRotatingRatio()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'colorfulCover':
                $value = $this->asColorfulCover()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'disloyalValue':
                $value = $this->asDisloyalValue()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'gruesomeCoach':
                $value = $this->asGruesomeCoach()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'totalWork':
                $value = $this->asTotalWork()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'harmoniousPlay':
                $value = $this->asHarmoniousPlay()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'uniqueStress':
                $value = $this->asUniqueStress()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'unwillingSmoke':
                $value = $this->asUnwillingSmoke()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'frozenSleep':
                $value = $this->asFrozenSleep()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'diligentDeal':
                $value = $this->asDiligentDeal()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'attractiveScript':
                $value = $this->asAttractiveScript()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'hoarseMouse':
                $value = $this->asHoarseMouse()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'circularCard':
                $value = $this->asCircularCard()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'potableBad':
                $value = $this->asPotableBad()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'triangularRepair':
                $value = $this->asTriangularRepair()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'gaseousRoad':
                $value = $this->asGaseousRoad()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case '_unknown':
            default:
                if (is_null($this->value)){
                    break;
                }
                if ($this->value instanceof JsonSerializableType){
                    $value = $this->value->jsonSerialize();
                    $result = array_merge($value, $result);
                } elseif (is_array($this->value)){
                    $result = array_merge($this->value, $result);
                }
        }
        
        return $result;
    }

    /**
     * @param string $json
     */
    public static function fromJson(string $json): static {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)){
            throw new Exception("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function jsonDeserialize(array $data): static {
        $args = [];
        if (!array_key_exists('id', $data)){
            throw new Exception(
                "JSON data is missing property 'id'",
            );
        }
        if (!(is_string($data['id']))){
            throw new Exception(
                "Expected property 'id' in JSON data to be string, instead received " . get_debug_type($data['id']),
            );
        }
        $args['id'] = $data['id'];
        
        if (!array_key_exists('created-at', $data)){
            throw new Exception(
                "JSON data is missing property 'created-at'",
            );
        }
        if (!($data['created-at'] instanceof DateTime)){
            throw new Exception(
                "Expected property 'createdAt' in JSON data to be dateTime, instead received " . get_debug_type($data['created-at']),
            );
        }
        $args['createdAt'] = $data['created-at'];
        
        if (!array_key_exists('archived-at', $data)){
            throw new Exception(
                "JSON data is missing property 'archived-at'",
            );
        }
        if (!((is_null($data['archived-at']) || $data['archived-at'] instanceof DateTime))){
            throw new Exception(
                "Expected property 'archivedAt' in JSON data to be optional, instead received " . get_debug_type($data['archived-at']),
            );
        }
        $args['archivedAt'] = $data['archived-at'];
        
        if (!array_key_exists('type', $data)){
            throw new Exception(
                "JSON data is missing property 'type'",
            );
        }
        $type = $data['type'];
        if (!(is_string($type))){
            throw new Exception(
                "Expected property 'type' in JSON data to be string, instead received " . get_debug_type($data['type']),
            );
        }
        
        $args['type'] = $type;
        switch ($type){
            case 'normalSweet':
                $args['value'] = NormalSweet::jsonDeserialize($data);
                break;
            case 'thankfulFactor':
                $args['value'] = ThankfulFactor::jsonDeserialize($data);
                break;
            case 'jumboEnd':
                $args['value'] = JumboEnd::jsonDeserialize($data);
                break;
            case 'hastyPain':
                $args['value'] = HastyPain::jsonDeserialize($data);
                break;
            case 'mistySnow':
                $args['value'] = MistySnow::jsonDeserialize($data);
                break;
            case 'distinctFailure':
                $args['value'] = DistinctFailure::jsonDeserialize($data);
                break;
            case 'practicalPrinciple':
                $args['value'] = PracticalPrinciple::jsonDeserialize($data);
                break;
            case 'limpingStep':
                $args['value'] = LimpingStep::jsonDeserialize($data);
                break;
            case 'vibrantExcitement':
                $args['value'] = VibrantExcitement::jsonDeserialize($data);
                break;
            case 'activeDiamond':
                $args['value'] = ActiveDiamond::jsonDeserialize($data);
                break;
            case 'popularLimit':
                $args['value'] = PopularLimit::jsonDeserialize($data);
                break;
            case 'falseMirror':
                $args['value'] = FalseMirror::jsonDeserialize($data);
                break;
            case 'primaryBlock':
                $args['value'] = PrimaryBlock::jsonDeserialize($data);
                break;
            case 'rotatingRatio':
                $args['value'] = RotatingRatio::jsonDeserialize($data);
                break;
            case 'colorfulCover':
                $args['value'] = ColorfulCover::jsonDeserialize($data);
                break;
            case 'disloyalValue':
                $args['value'] = DisloyalValue::jsonDeserialize($data);
                break;
            case 'gruesomeCoach':
                $args['value'] = GruesomeCoach::jsonDeserialize($data);
                break;
            case 'totalWork':
                $args['value'] = TotalWork::jsonDeserialize($data);
                break;
            case 'harmoniousPlay':
                $args['value'] = HarmoniousPlay::jsonDeserialize($data);
                break;
            case 'uniqueStress':
                $args['value'] = UniqueStress::jsonDeserialize($data);
                break;
            case 'unwillingSmoke':
                $args['value'] = UnwillingSmoke::jsonDeserialize($data);
                break;
            case 'frozenSleep':
                $args['value'] = FrozenSleep::jsonDeserialize($data);
                break;
            case 'diligentDeal':
                $args['value'] = DiligentDeal::jsonDeserialize($data);
                break;
            case 'attractiveScript':
                $args['value'] = AttractiveScript::jsonDeserialize($data);
                break;
            case 'hoarseMouse':
                $args['value'] = HoarseMouse::jsonDeserialize($data);
                break;
            case 'circularCard':
                $args['value'] = CircularCard::jsonDeserialize($data);
                break;
            case 'potableBad':
                $args['value'] = PotableBad::jsonDeserialize($data);
                break;
            case 'triangularRepair':
                $args['value'] = TriangularRepair::jsonDeserialize($data);
                break;
            case 'gaseousRoad':
                $args['value'] = GaseousRoad::jsonDeserialize($data);
                break;
            case '_unknown':
            default:
                $args['type'] = '_unknown';
                $args['value'] = $data;
        }
        
        // @phpstan-ignore-next-line
        return new static($args);
    }
}
