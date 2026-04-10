<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionBar extends JsonSerializableType
{
    /**
     * @var ?Bar $bar
     */
    #[JsonProperty('bar')]
    private ?Bar $bar;

    /**
     * @param array{
     *   bar?: ?Bar,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->bar = $values['bar'] ?? null;
    }

    /**
     * @return ?Bar
     */
    public function getBar(): ?Bar
    {
        return $this->bar;
    }

    /**
     * @param ?Bar $value
     */
    public function setBar(?Bar $value = null): self
    {
        $this->bar = $value;
        $this->_setField('bar');
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
