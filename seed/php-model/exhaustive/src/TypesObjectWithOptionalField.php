<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use DateTime;
use Seed\Core\Types\Date;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class TypesObjectWithOptionalField extends JsonSerializableType
{
    /**
     * @var ?string $string This is a rather long descriptor of this single field in a more complex type. If you ask me I think this is a pretty good description for this field all things considered.
     */
    #[JsonProperty('string')]
    public ?string $string;

    /**
     * @var ?int $integer
     */
    #[JsonProperty('integer')]
    public ?int $integer;

    /**
     * @var ?int $long
     */
    #[JsonProperty('long')]
    public ?int $long;

    /**
     * @var ?float $double
     */
    #[JsonProperty('double')]
    public ?float $double;

    /**
     * @var ?bool $bool
     */
    #[JsonProperty('bool')]
    public ?bool $bool;

    /**
     * @var ?DateTime $datetime
     */
    #[JsonProperty('datetime'), Date(Date::TYPE_DATETIME)]
    public ?DateTime $datetime;

    /**
     * @var ?DateTime $date
     */
    #[JsonProperty('date'), Date(Date::TYPE_DATE)]
    public ?DateTime $date;

    /**
     * @var ?string $uuid
     */
    #[JsonProperty('uuid')]
    public ?string $uuid;

    /**
     * @var ?string $base64
     */
    #[JsonProperty('base64')]
    public ?string $base64;

    /**
     * @var ?array<string> $list
     */
    #[JsonProperty('list'), ArrayType(['string'])]
    public ?array $list;

    /**
     * @var ?array<string> $set
     */
    #[JsonProperty('set'), ArrayType(['string'])]
    public ?array $set;

    /**
     * @var ?array<string, ?string> $map
     */
    #[JsonProperty('map'), ArrayType(['string' => new Union('string', 'null')])]
    public ?array $map;

    /**
     * @var ?int $bigint
     */
    #[JsonProperty('bigint')]
    public ?int $bigint;

    /**
     * @param array{
     *   string?: ?string,
     *   integer?: ?int,
     *   long?: ?int,
     *   double?: ?float,
     *   bool?: ?bool,
     *   datetime?: ?DateTime,
     *   date?: ?DateTime,
     *   uuid?: ?string,
     *   base64?: ?string,
     *   list?: ?array<string>,
     *   set?: ?array<string>,
     *   map?: ?array<string, ?string>,
     *   bigint?: ?int,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->string = $values['string'] ?? null;
        $this->integer = $values['integer'] ?? null;
        $this->long = $values['long'] ?? null;
        $this->double = $values['double'] ?? null;
        $this->bool = $values['bool'] ?? null;
        $this->datetime = $values['datetime'] ?? null;
        $this->date = $values['date'] ?? null;
        $this->uuid = $values['uuid'] ?? null;
        $this->base64 = $values['base64'] ?? null;
        $this->list = $values['list'] ?? null;
        $this->set = $values['set'] ?? null;
        $this->map = $values['map'] ?? null;
        $this->bigint = $values['bigint'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
