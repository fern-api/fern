<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Date;

class StatusArchived extends JsonSerializableType
{
    /**
     * @var ?DateTime $value
     */
    #[JsonProperty('value'), Date(Date::TYPE_DATETIME)]
    public ?DateTime $value;

    /**
     * @param array{
     *   value?: ?DateTime,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
