<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $value
 */
trait FrozenSleep
{
    /**
     * @var string $value
     */
    #[JsonProperty('value')]
    private string $value;

    /**
     * @return string
     */
    public function getValue(): string
    {
        return $this->value;
    }

    /**
     * @param string $value
     */
    public function setValue(string $value): self
    {
        $this->value = $value;
        $this->_setField('value');
        return $this;
    }
}
