<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithDuplicativeDiscriminantsOne extends JsonSerializableType
{
    /**
     * @var ?value-of<UnionWithDuplicativeDiscriminantsOneType> $type
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
     *   type?: ?value-of<UnionWithDuplicativeDiscriminantsOneType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'] ?? null;
        $this->title = $values['title'];
    }

    /**
     * @return ?value-of<UnionWithDuplicativeDiscriminantsOneType>
     */
    public function getType(): ?string
    {
        return $this->type;
    }

    /**
     * @param ?value-of<UnionWithDuplicativeDiscriminantsOneType> $value
     */
    public function setType(?string $value = null): self
    {
        $this->type = $value;
        $this->_setField('type');
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
        $this->_setField('title');
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
