<?php

namespace Seed\Types\Object\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * Tests that unknown types are able to preserve their type names.
 */
class ObjectWithDocumentedUnknownType extends JsonSerializableType
{
    /**
     * @var mixed $documentedUnknownType
     */
    #[JsonProperty('documentedUnknownType')]
    public mixed $documentedUnknownType;

    /**
     * @param array{
     *   documentedUnknownType: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->documentedUnknownType = $values['documentedUnknownType'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
