<?php

namespace Seed\Union\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class WithName extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    private string $name;

    /**
     * @param array{
     *   name: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->name = $values['name'];
    }

    /**
     * @return string
     */
    public function getName(): string {
        return $this->name;}

    /**
     * @param string $value
     */
    public function setName(string $value): self {
        $this->name = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
