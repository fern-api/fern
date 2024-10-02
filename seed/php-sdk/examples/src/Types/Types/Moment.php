<?php

namespace Seed\Types\Types;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;
use DateTime;
use Seed\Core\Types\DateType;

class Moment extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var DateTime $date
     */
    #[JsonProperty('date'), DateType(DateType::TYPE_DATE)]
    public DateTime $date;

    /**
     * @var DateTime $datetime
     */
    #[JsonProperty('datetime'), DateType(DateType::TYPE_DATETIME)]
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
    ) {
        $this->id = $values['id'];
        $this->date = $values['date'];
        $this->datetime = $values['datetime'];
    }
}
