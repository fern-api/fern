<?php

namespace Seed\Core\Types;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS)]
class DiscriminatedUnionType
{
    public const int DISCRIMINANT_INDEX = 0;
    public const int TYPES_INDEX = 1;

    /**
     * @param array<string, mixed> type
     */
    public function __construct(
        public readonly string $discriminant,
        public readonly array $types,
    ) {}
}
