<?php

namespace Seed\Types\Object;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use DateTime;
use Seed\Core\DateType;
use Seed\Core\ArrayType;

class ObjectWithOptionalField extends SerializableType
{
    /**
     * @var ?string $string This is a rather long descriptor of this single field in a more complex type. If you ask me I think this is a pretty good description for this field all things considered.
     */
    #[JsonProperty("string")]
    public ?string $string;

    /**
     * @var ?int $integer
     */
    #[JsonProperty("integer")]
    public ?int $integer;

    /**
     * @var ?int $long
     */
    #[JsonProperty("long")]
    public ?int $long;

    /**
     * @var ?float $double
     */
    #[JsonProperty("double")]
    public ?float $double;

    /**
     * @var ?bool $bool
     */
    #[JsonProperty("bool")]
    public ?bool $bool;

    /**
     * @var ?DateTime $datetime
     */
    #[JsonProperty("datetime"), DateType(DateType::TYPE_DATETIME)]
    public ?DateTime $datetime;

    /**
     * @var ?DateTime $date
     */
    #[JsonProperty("date"), DateType(DateType::TYPE_DATE)]
    public ?DateTime $date;

    /**
     * @var ?string $uuid
     */
    #[JsonProperty("uuid")]
    public ?string $uuid;

    /**
     * @var ?string $base64
     */
    #[JsonProperty("base64")]
    public ?string $base64;

    /**
     * @var ?array<string> $list
     */
    #[JsonProperty("list"), ArrayType(["string"])]
    public ?array $list;

    /**
     * @var ?array<string> $set
     */
    #[JsonProperty("set"), ArrayType(["string"])]
    public ?array $set;

    /**
     * @var ?array<int, string> $map
     */
    #[JsonProperty("map"), ArrayType(["integer" => "string"])]
    public ?array $map;

    /**
     * @var ?string $bigint
     */
    #[JsonProperty("bigint")]
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
