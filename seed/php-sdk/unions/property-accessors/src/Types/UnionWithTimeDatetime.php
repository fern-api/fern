<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Date;

class UnionWithTimeDatetime extends JsonSerializableType
{
    /**
     * @var ?DateTime $value
     */
    #[JsonProperty('value'), Date(Date::TYPE_DATETIME)]
    private ?DateTime $value;

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
     * @return ?DateTime
     */
    public function getValue(): ?DateTime
    {
        return $this->value;
    }

    /**
     * @param ?DateTime $value
     */
    public function setValue(?DateTime $value = null): self
    {
        $this->value = $value;
        $this->_setField('value');
        return $this;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
