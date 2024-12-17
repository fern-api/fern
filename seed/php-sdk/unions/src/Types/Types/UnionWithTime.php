<?php

namespace Seed\Types\Types;

use DateTime;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Json\JsonSkip;
use Seed\Core\Types\Date;
use Seed\Core\Types\DiscriminatedUnion;
use Seed\Core\Types\Discriminant;

class UnionWithTime extends DiscriminatedUnion
{
    /**
     * @var 'value'|'date'|'datetime'|'_unknown' $type 
     */
    #[JsonProperty('type')]
    #[Discriminant([
        'value' => 'integer',
        'date' => new Date(Date::TYPE_DATE),
        'datetime' => new Date(Date::TYPE_DATETIME),
    ])]
    public string $type;

    /**
     * @var int|DateTime|mixed
     */
    #[JsonSkip]
    public mixed $value;

    /**
     * @param ?array{
     *   type?: 'value'|'date'|'datetime'|'_unknown',
     *   value?: int|DateTime|mixed,
     * } $options
     */
    public function __construct(
        private readonly ?array $options = null,
    ) {
        $this->type = $this->options['type'] ?? '_unknown';
        $this->value = $this->options['value'] ?? null;
    }

    public static function value(
        int $value
    ): UnionWithTime {
        return new UnionWithTime([
            'type' => 'value',
            'value' => $value
        ]);
    }

    public static function date(
        DateTime $date
    ): UnionWithTime {
        return new UnionWithTime([
            'type' => 'date',
            'date' => $date
        ]);
    }

    public static function datetime(
        DateTime $datetime
    ): UnionWithTime {
        return new UnionWithTime([
            'type' => 'datetime',
            'datetime' => $datetime
        ]);
    }

    public static function _unknown(
        mixed $_unknown
    ): UnionWithTime {
        return new UnionWithTime([
            '_unknown' => $_unknown
        ]);
    }

    public function asValue(): int
    {
        if ($this->type != 'value') {
            throw new \Exception(
                "Expected type to be 'value'; got '$this->type.'"
            );
        }

        if (!is_int($this->value)) {
            throw new \Exception(
                "Expected value to be int."
            );
        }

        return $this->value;
    }

    public function asDate(): DateTime
    {
        if ($this->type != 'date') {
            throw new \Exception(
                "Expected type to be 'date'; got '$this->type.'"
            );
        }

        if (!($this->value instanceof DateTime)) {
            throw new \Exception(
                "Expected value to be instance of DateTime."
            );
        }

        return $this->value;
    }

    public function asDatetime(): DateTime
    {
        if ($this->type != 'datetime') {
            throw new \Exception(
                "Expected type to be 'datetime'; got '$this->type.'"
            );
        }

        if (!($this->value instanceof DateTime)) {
            throw new \Exception(
                "Expected value to be instance of DateTime."
            );
        }

        return $this->value;
    }
}
