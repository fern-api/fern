<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * This schema has nullable:true at the top level.
 *
 * @property ?string $nullableField
 */
trait NullableObject
{
    /**
     * @var ?string $nullableField
     */
    #[JsonProperty('nullableField')]
    public ?string $nullableField;
}
