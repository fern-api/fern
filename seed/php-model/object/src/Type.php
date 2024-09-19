<?php

namespace Seed;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use DateTime;
use Seed\Core\DateType;
use Seed\Core\ArrayType;
use Seed\Core\Union;

/**
* Exercises all of the built-in types.
 */
class Type extends SerializableType
{
    /**
     * @var int $one
     */
    #[JsonProperty("one")]
    public int $one;

    /**
     * @var float $two
     */
    #[JsonProperty("two")]
    public float $two;

    /**
     * @var string $three
     */
    #[JsonProperty("three")]
    public string $three;

    /**
     * @var bool $four
     */
    #[JsonProperty("four")]
    public bool $four;

    /**
     * @var int $five
     */
    #[JsonProperty("five")]
    public int $five;

    /**
     * @var DateTime $six
     */
    #[JsonProperty("six"), DateType(DateType::TYPE_DATETIME)]
    public DateTime $six;

    /**
     * @var DateTime $seven
     */
    #[JsonProperty("seven"), DateType(DateType::TYPE_DATE)]
    public DateTime $seven;

    /**
     * @var string $eight
     */
    #[JsonProperty("eight")]
    public string $eight;

    /**
     * @var string $nine
     */
    #[JsonProperty("nine")]
    public string $nine;

    /**
     * @var array<int> $ten
     */
    #[JsonProperty("ten"), ArrayType(["integer"])]
    public array $ten;

    /**
     * @var array<float> $eleven
     */
    #[JsonProperty("eleven"), ArrayType(["float"])]
    public array $eleven;

    /**
     * @var array<string, bool> $twelve
     */
    #[JsonProperty("twelve"), ArrayType(["string" => "bool"])]
    public array $twelve;

    /**
     * @var mixed $fourteen
     */
    #[JsonProperty("fourteen")]
    public mixed $fourteen;

    /**
     * @var array<array<int>> $fifteen
     */
    #[JsonProperty("fifteen"), ArrayType([["integer"]])]
    public array $fifteen;

    /**
     * @var array<array<string, int>> $sixteen
     */
    #[JsonProperty("sixteen"), ArrayType([["string" => "integer"]])]
    public array $sixteen;

    /**
     * @var array<?string> $seventeen
     */
    #[JsonProperty("seventeen"), ArrayType([new Union("string", "null")])]
    public array $seventeen;

    /**
     * @var string $eighteen
     */
    #[JsonProperty("eighteen")]
    public string $eighteen;

    /**
     * @var Name $nineteen
     */
    #[JsonProperty("nineteen")]
    public Name $nineteen;

    /**
     * @var int $twenty
     */
    #[JsonProperty("twenty")]
    public int $twenty;

    /**
     * @var int $twentyone
     */
    #[JsonProperty("twentyone")]
    public int $twentyone;

    /**
     * @var float $twentytwo
     */
    #[JsonProperty("twentytwo")]
    public float $twentytwo;

    /**
     * @var string $twentythree
     */
    #[JsonProperty("twentythree")]
    public string $twentythree;

    /**
     * @var ?int $thirteen
     */
    #[JsonProperty("thirteen")]
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
