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
    public array $references;

    /**
     * @var array<string, mixed> $metadata
     */
    #[JsonProperty('metadata'), ArrayType(['string' => 'mixed'])]
    public array $metadata;

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
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
