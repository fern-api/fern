<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnionWithDuplicativeDiscriminantsZero extends JsonSerializableType
{
    /**
     * @var ?value-of<UnionWithDuplicativeDiscriminantsZeroType> $type
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
     *   type?: ?value-of<UnionWithDuplicativeDiscriminantsZeroType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'] ?? null;
        $this->name = $values['name'];
    }

    /**
     * @return ?value-of<UnionWithDuplicativeDiscriminantsZeroType>
     */
    public function getType(): ?string
    {
        return $this->type;
    }

    /**
     * @param ?value-of<UnionWithDuplicativeDiscriminantsZeroType> $value
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
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @param string $value
     */
    public function setName(string $value): self
    {
        $this->name = $value;
        $this->_setField('name');
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
