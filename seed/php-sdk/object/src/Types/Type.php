<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\DateType;
use DateTime;
use Seed\Core\ArrayType;
use Seed\Core\Union;
use Seed\Types\Name;

/**
* Exercises all of the built-in types.
 */
class Type extends SerializableType
{
    #[JsonProperty("one")]
    /**
     * @var int $one
     */
    public int $one;

    #[JsonProperty("two")]
    /**
     * @var float $two
     */
    public float $two;

    #[JsonProperty("three")]
    /**
     * @var string $three
     */
    public string $three;

    #[JsonProperty("four")]
    /**
     * @var bool $four
     */
    public bool $four;

    #[JsonProperty("five")]
    /**
     * @var int $five
     */
    public int $five;

    #[JsonProperty("six"), DateType(DateType::TYPE_DATETIME)]
    /**
     * @var DateTime $six
     */
    public DateTime $six;

    #[JsonProperty("seven"), DateType(DateType::TYPE_DATE)]
    /**
     * @var DateTime $seven
     */
    public DateTime $seven;

    #[JsonProperty("eight")]
    /**
     * @var string $eight
     */
    public string $eight;

    #[JsonProperty("nine")]
    /**
     * @var string $nine
     */
    public string $nine;

    #[JsonProperty("ten"), ArrayType(["integer"])]
    /**
     * @var array<int> $ten
     */
    public array $ten;

    #[JsonProperty("eleven"), ArrayType(["float"])]
    /**
     * @var array<float> $eleven
     */
    public array $eleven;

    #[JsonProperty("twelve"), ArrayType(["string" => "bool"])]
    /**
     * @var array<string, bool> $twelve
     */
    public array $twelve;

    #[JsonProperty("fourteen")]
    /**
     * @var mixed $fourteen
     */
    public mixed $fourteen;

    #[JsonProperty("fifteen"), ArrayType([["integer"]])]
    /**
     * @var array<array<int>> $fifteen
     */
    public array $fifteen;

    #[JsonProperty("sixteen"), ArrayType([["string" => "integer"]])]
    /**
     * @var array<array<string, int>> $sixteen
     */
    public array $sixteen;

    #[JsonProperty("seventeen"), ArrayType([new Union("string", "null")])]
    /**
     * @var array<?string> $seventeen
     */
    public array $seventeen;

    #[JsonProperty("eighteen")]
    /**
     * @var string $eighteen
     */
    public string $eighteen;

    #[JsonProperty("nineteen")]
    /**
     * @var Name $nineteen
     */
    public Name $nineteen;

    #[JsonProperty("twenty")]
    /**
     * @var int $twenty
     */
    public int $twenty;

    #[JsonProperty("twentyone")]
    /**
     * @var int $twentyone
     */
    public int $twentyone;

    #[JsonProperty("twentytwo")]
    /**
     * @var float $twentytwo
     */
    public float $twentytwo;

    #[JsonProperty("twentythree")]
    /**
     * @var string $twentythree
     */
    public string $twentythree;

    #[JsonProperty("thirteen")]
    /**
     * @var ?int $thirteen
     */
    public ?int $thirteen;

    /**
     * @param int $one
     * @param float $two
     * @param string $three
     * @param bool $four
     * @param int $five
     * @param DateTime $six
     * @param DateTime $seven
     * @param string $eight
     * @param string $nine
     * @param array<int> $ten
     * @param array<float> $eleven
     * @param array<string, bool> $twelve
     * @param mixed $fourteen
     * @param array<array<int>> $fifteen
     * @param array<array<string, int>> $sixteen
     * @param array<?string> $seventeen
     * @param string $eighteen
     * @param Name $nineteen
     * @param int $twenty
     * @param int $twentyone
     * @param float $twentytwo
     * @param string $twentythree
     * @param ?int $thirteen
     */
    public function __construct(
        int $one,
        float $two,
        string $three,
        bool $four,
        int $five,
        DateTime $six,
        DateTime $seven,
        string $eight,
        string $nine,
        array $ten,
        array $eleven,
        array $twelve,
        mixed $fourteen,
        array $fifteen,
        array $sixteen,
        array $seventeen,
        string $eighteen,
        Name $nineteen,
        int $twenty,
        int $twentyone,
        float $twentytwo,
        string $twentythree,
        ?int $thirteen = null,
    ) {
        $this->one = $one;
        $this->two = $two;
        $this->three = $three;
        $this->four = $four;
        $this->five = $five;
        $this->six = $six;
        $this->seven = $seven;
        $this->eight = $eight;
        $this->nine = $nine;
        $this->ten = $ten;
        $this->eleven = $eleven;
        $this->twelve = $twelve;
        $this->fourteen = $fourteen;
        $this->fifteen = $fifteen;
        $this->sixteen = $sixteen;
        $this->seventeen = $seventeen;
        $this->eighteen = $eighteen;
        $this->nineteen = $nineteen;
        $this->twenty = $twenty;
        $this->twentyone = $twentyone;
        $this->twentytwo = $twentytwo;
        $this->twentythree = $twentythree;
        $this->thirteen = $thirteen;
    }
}
