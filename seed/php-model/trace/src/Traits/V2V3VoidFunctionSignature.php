<?php

namespace Seed\Traits;

use Seed\V2V3Parameter;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property array<V2V3Parameter> $parameters
 */
trait V2V3VoidFunctionSignature
{
    /**
     * @var array<V2V3Parameter> $parameters
     */
    #[JsonProperty('parameters'), ArrayType([V2V3Parameter::class])]
    public array $parameters;
}
