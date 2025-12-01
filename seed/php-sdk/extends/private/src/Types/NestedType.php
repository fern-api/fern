<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\Json;
use Seed\Core\Json\JsonProperty;

class NestedType extends JsonSerializableType
{
    use Json;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    private string $name;

    /**
     * @param array{
     *   raw: string,
     *   docs: string,
     *   name: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->raw = $values['raw'];$this->docs = $values['docs'];$this->name = $values['name'];
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
