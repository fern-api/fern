<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use DateTime;
use Seed\Core\Types\Date;

class Moment extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var DateTime $date
     */
    #[JsonProperty('date'), Date(Date::TYPE_DATE)]
    public DateTime $date;

    /**
     * @var DateTime $datetime
     */
    #[JsonProperty('datetime'), Date(Date::TYPE_DATETIME)]
    public DateTime $datetime;

    /**
     * @param array{
     *   id: string,
     *   date: DateTime,
     *   datetime: DateTime,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->date = $values['date'];$this->datetime = $values['datetime'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
