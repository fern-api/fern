<?php

namespace Seed\Traits;

use Seed\V2Parameter;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * @property array<V2Parameter> $parameters
 */
trait V2VoidFunctionSignature
{
    /**
     * @var array<V2Parameter> $parameters
     */
    #[JsonProperty('parameters'), ArrayType([V2Parameter::class])]
    public array $parameters;
}
