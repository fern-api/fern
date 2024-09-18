<?php

namespace Seed\Types\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\DateType;
use DateTime;

class Moment extends SerializableType
{
    #[JsonProperty("id")]
    /**
     * @var string $id
     */
    public string $id;

    #[JsonProperty("date"), DateType(DateType::TYPE_DATE)]
    /**
     * @var DateTime $date
     */
    public DateTime $date;

    #[JsonProperty("datetime"), DateType(DateType::TYPE_DATETIME)]
    /**
     * @var DateTime $datetime
     */
    public DateTime $datetime;

    /**
     * @param string $id
     * @param DateTime $date
     * @param DateTime $datetime
     */
    public function __construct(
        string $id,
        DateTime $date,
        DateTime $datetime,
    ) {
        $this->id = $id;
        $this->date = $date;
        $this->datetime = $datetime;
    }
}
