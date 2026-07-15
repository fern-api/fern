<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class TypeWithOptionalReferenceMap extends JsonSerializableType
{
    /**
     * @var array<string, ?Foo> $references
     */
    #[JsonProperty('references'), ArrayType(['string' => new Union(Foo::class, 'null')])]
    private array $references;

    /**
     * @var array<string, mixed> $metadata
     */
    #[JsonProperty('metadata'), ArrayType(['string' => 'mixed'])]
    private array $metadata;

    /**
     * @param array{
     *   references: array<string, ?Foo>,
     *   metadata: array<string, mixed>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->references = $values['references'];
        $this->metadata = $values['metadata'];
    }

    /**
     * @return array<string, ?Foo>
     */
    public function getReferences(): array
    {
        return $this->references;
    }

    /**
     * @param array<string, ?Foo> $value
     */
    public function setReferences(array $value): self
    {
        $this->references = $value;
        $this->_setField('references');
        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    public function getMetadata(): array
    {
        return $this->metadata;
    }

    /**
     * @param array<string, mixed> $value
     */
    public function setMetadata(array $value): self
    {
        $this->metadata = $value;
        $this->_setField('metadata');
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
