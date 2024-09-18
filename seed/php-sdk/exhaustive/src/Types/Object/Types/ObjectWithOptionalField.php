<?php

namespace Seed\Types\Object\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\DateType;
use DateTime;
use Seed\Core\ArrayType;

class ObjectWithOptionalField extends SerializableType
{
    #[JsonProperty("string")]
    /**
     * @var ?string $string This is a rather long descriptor of this single field in a more complex type. If you ask me I think this is a pretty good description for this field all things considered.
     */
    public ?string $string;

    #[JsonProperty("integer")]
    /**
     * @var ?int $integer
     */
    public ?int $integer;

    #[JsonProperty("long")]
    /**
     * @var ?int $long
     */
    public ?int $long;

    #[JsonProperty("double")]
    /**
     * @var ?float $double
     */
    public ?float $double;

    #[JsonProperty("bool")]
    /**
     * @var ?bool $bool
     */
    public ?bool $bool;

    #[JsonProperty("datetime"), DateType(DateType::TYPE_DATETIME)]
    /**
     * @var ?DateTime $datetime
     */
    public ?DateTime $datetime;

    #[JsonProperty("date"), DateType(DateType::TYPE_DATE)]
    /**
     * @var ?DateTime $date
     */
    public ?DateTime $date;

    #[JsonProperty("uuid")]
    /**
     * @var ?string $uuid
     */
    public ?string $uuid;

    #[JsonProperty("base64")]
    /**
     * @var ?string $base64
     */
    public ?string $base64;

    #[JsonProperty("list"), ArrayType(["string"])]
    /**
     * @var ?array<string> $list
     */
    public ?array $list;

    #[JsonProperty("set"), ArrayType(["string"])]
    /**
     * @var ?array<string> $set
     */
    public ?array $set;

    #[JsonProperty("map"), ArrayType(["integer" => "string"])]
    /**
     * @var ?array<int, string> $map
     */
    public ?array $map;

    #[JsonProperty("bigint")]
    /**
     * @var ?string $bigint
     */
    public ?string $bigint;

    /**
     * @param ?string $string This is a rather long descriptor of this single field in a more complex type. If you ask me I think this is a pretty good description for this field all things considered.
     * @param ?int $integer
     * @param ?int $long
     * @param ?float $double
     * @param ?bool $bool
     * @param ?DateTime $datetime
     * @param ?DateTime $date
     * @param ?string $uuid
     * @param ?string $base64
     * @param ?array<string> $list
     * @param ?array<string> $set
     * @param ?array<int, string> $map
     * @param ?string $bigint
     */
    public function __construct(
        ?string $string = null,
        ?int $integer = null,
        ?int $long = null,
        ?float $double = null,
        ?bool $bool = null,
        ?DateTime $datetime = null,
        ?DateTime $date = null,
        ?string $uuid = null,
        ?string $base64 = null,
        ?array $list = null,
        ?array $set = null,
        ?array $map = null,
        ?string $bigint = null,
    ) {
        $this->string = $string;
        $this->integer = $integer;
        $this->long = $long;
        $this->double = $double;
        $this->bool = $bool;
        $this->datetime = $datetime;
        $this->date = $date;
        $this->uuid = $uuid;
        $this->base64 = $base64;
        $this->list = $list;
        $this->set = $set;
        $this->map = $map;
        $this->bigint = $bigint;
    }
}
