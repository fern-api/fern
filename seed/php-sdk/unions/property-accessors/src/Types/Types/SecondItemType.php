<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class SecondItemType extends JsonSerializableType
{
    /**
     * @var ?'secondItemType' $type
     */
    #[JsonProperty('type')]
    private ?string $type;

    /**
     * @var string $title
     */
    #[JsonProperty('title')]
    private string $title;

    /**
     * @param array{
     *   title: string,
     *   type?: ?'secondItemType',
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'] ?? null;
        $this->title = $values['title'];
    }

    /**
     * @return ?'secondItemType'
     */
    public function getType(): ?string
    {
        return $this->type;
    }

    /**
     * @param ?'secondItemType' $value
     */
    public function setType(?string $value = null): self
    {
        $this->type = $value;
        return $this;
    }

    /**
     * @return string
     */
    public function getTitle(): string
    {
        return $this->title;
    }

    /**
     * @param string $value
     */
    public function setTitle(string $value): self
    {
        $this->title = $value;
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
