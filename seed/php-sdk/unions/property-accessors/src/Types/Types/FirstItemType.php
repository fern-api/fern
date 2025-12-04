<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class FirstItemType extends JsonSerializableType
{
    /**
     * @var ?'firstItemType' $type
     */
    #[JsonProperty('type')]
    private ?string $type;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    private string $name;

    /**
     * @param array{
     *   name: string,
     *   type?: ?'firstItemType',
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->type = $values['type'] ?? null;$this->name = $values['name'];
    }

    /**
     * @return ?'firstItemType'
     */
    public function getType(): ?string {
        return $this->type;}

    /**
     * @param ?'firstItemType' $value
     */
    public function setType(?string $value = null): self {
        $this->type = $value;return $this;}

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
