<?php

namespace Seed\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use DateTime;
use Seed\Core\DateType;

class Moment extends SerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty("id")]
    public string $id;

    /**
     * @var DateTime $date
     */
    #[JsonProperty("date"), DateType(DateType::TYPE_DATE)]
    public DateTime $date;

    /**
     * @var DateTime $datetime
     */
    #[JsonProperty("datetime"), DateType(DateType::TYPE_DATETIME)]
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
