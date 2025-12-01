<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use DateTime;
use Seed\Core\Types\Date;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

/**
 * Exercises all of the built-in types.
 */
class Type extends JsonSerializableType
{
    /**
     * @var int $one
     */
    #[JsonProperty('one')]
    public int $one;

    /**
     * @var float $two
     */
    #[JsonProperty('two')]
    public float $two;

    /**
     * @var string $three
     */
    #[JsonProperty('three')]
    public string $three;

    /**
     * @var bool $four
     */
    #[JsonProperty('four')]
    public bool $four;

    /**
     * @var int $five
     */
    #[JsonProperty('five')]
    public int $five;

    /**
     * @var DateTime $six
     */
    #[JsonProperty('six'), Date(Date::TYPE_DATETIME)]
    public DateTime $six;

    /**
     * @var DateTime $seven
     */
    #[JsonProperty('seven'), Date(Date::TYPE_DATE)]
    public DateTime $seven;

    /**
     * @var string $eight
     */
    #[JsonProperty('eight')]
    public string $eight;

    /**
     * @var string $nine
     */
    #[JsonProperty('nine')]
    public string $nine;

    /**
     * @var array<int> $ten
     */
    #[JsonProperty('ten'), ArrayType(['integer'])]
    public array $ten;

    /**
     * @var array<float> $eleven
     */
    #[JsonProperty('eleven'), ArrayType(['float'])]
    public array $eleven;

    /**
     * @var array<string, bool> $twelve
     */
    #[JsonProperty('twelve'), ArrayType(['string' => 'bool'])]
    public array $twelve;

    /**
     * @var ?int $thirteen
     */
    #[JsonProperty('thirteen')]
    public ?int $thirteen;

    /**
     * @var mixed $fourteen
     */
    #[JsonProperty('fourteen')]
    public mixed $fourteen;

    /**
     * @var array<array<int>> $fifteen
     */
    #[JsonProperty('fifteen'), ArrayType([['integer']])]
    public array $fifteen;

    /**
     * @var array<array<string, int>> $sixteen
     */
    #[JsonProperty('sixteen'), ArrayType([['string' => 'integer']])]
    public array $sixteen;

    /**
     * @var array<?string> $seventeen
     */
    #[JsonProperty('seventeen'), ArrayType([new Union('string', 'null')])]
    public array $seventeen;

    /**
     * @var 'eighteen' $eighteen
     */
    #[JsonProperty('eighteen')]
    public string $eighteen;

    /**
     * @var Name $nineteen
     */
    #[JsonProperty('nineteen')]
    public Name $nineteen;

    /**
     * @var int $twenty
     */
    #[JsonProperty('twenty')]
    public int $twenty;

    /**
     * @var int $twentyone
     */
    #[JsonProperty('twentyone')]
    public int $twentyone;

    /**
     * @var float $twentytwo
     */
    #[JsonProperty('twentytwo')]
    public float $twentytwo;

    /**
     * @var string $twentythree
     */
    #[JsonProperty('twentythree')]
    public string $twentythree;

    /**
     * @var ?DateTime $twentyfour
     */
    #[JsonProperty('twentyfour'), Date(Date::TYPE_DATETIME)]
    public ?DateTime $twentyfour;

    /**
     * @var ?DateTime $twentyfive
     */
    #[JsonProperty('twentyfive'), Date(Date::TYPE_DATE)]
    public ?DateTime $twentyfive;

    /**
     * @param array{
     *   one: int,
     *   two: float,
     *   three: string,
     *   four: bool,
     *   five: int,
     *   six: DateTime,
     *   seven: DateTime,
     *   eight: string,
     *   nine: string,
     *   ten: array<int>,
     *   eleven: array<float>,
     *   twelve: array<string, bool>,
     *   fourteen: mixed,
     *   fifteen: array<array<int>>,
     *   sixteen: array<array<string, int>>,
     *   seventeen: array<?string>,
     *   eighteen: 'eighteen',
     *   nineteen: Name,
     *   twenty: int,
     *   twentyone: int,
     *   twentytwo: float,
     *   twentythree: string,
     *   thirteen?: ?int,
     *   twentyfour?: ?DateTime,
     *   twentyfive?: ?DateTime,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->one = $values['one'];$this->two = $values['two'];$this->three = $values['three'];$this->four = $values['four'];$this->five = $values['five'];$this->six = $values['six'];$this->seven = $values['seven'];$this->eight = $values['eight'];$this->nine = $values['nine'];$this->ten = $values['ten'];$this->eleven = $values['eleven'];$this->twelve = $values['twelve'];$this->thirteen = $values['thirteen'] ?? null;$this->fourteen = $values['fourteen'];$this->fifteen = $values['fifteen'];$this->sixteen = $values['sixteen'];$this->seventeen = $values['seventeen'];$this->eighteen = $values['eighteen'];$this->nineteen = $values['nineteen'];$this->twenty = $values['twenty'];$this->twentyone = $values['twentyone'];$this->twentytwo = $values['twentytwo'];$this->twentythree = $values['twentythree'];$this->twentyfour = $values['twentyfour'] ?? null;$this->twentyfive = $values['twentyfive'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
