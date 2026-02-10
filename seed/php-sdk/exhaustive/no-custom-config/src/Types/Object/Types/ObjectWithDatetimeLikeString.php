<?php

namespace Seed\Types\Object\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use DateTime;
use Seed\Core\Types\Date;

/**
 * This type tests that string fields containing datetime-like values
 * are NOT reformatted by the wire test generator. The string field
 * should preserve its exact value even if it looks like a datetime.
 */
class ObjectWithDatetimeLikeString extends JsonSerializableType
{
    /**
     * @var string $datetimeLikeString A string field that happens to contain a datetime-like value
     */
    #[JsonProperty('datetimeLikeString')]
    public string $datetimeLikeString;

    /**
     * @var DateTime $actualDatetime An actual datetime field for comparison
     */
    #[JsonProperty('actualDatetime'), Date(Date::TYPE_DATETIME)]
    public DateTime $actualDatetime;

    /**
     * @param array{
     *   datetimeLikeString: string,
     *   actualDatetime: DateTime,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->datetimeLikeString = $values['datetimeLikeString'];
        $this->actualDatetime = $values['actualDatetime'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
