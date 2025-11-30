<?php

namespace Seed\Bigunion\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ActiveDiamond extends JsonSerializableType
{
    /**
     * @var string $value
     */
    #[JsonProperty('value')]
    private string $value;

    /**
     * @param array{
     *   value: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->value = $values['value'];
    }

    /**
     * @return string
     */
    public function getValue(): string {
        return $this->value;}

    /**
     * @param string $value
     */
    public function setValue(string $value): self {
        $this->value = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
