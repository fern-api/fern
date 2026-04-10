<?php

namespace Seed\Traits;

use Seed\Types\V2V3TestCaseImplementationDescription;
use Seed\Types\V2V3TestCaseFunctionZero;
use Seed\Types\V2V3TestCaseFunctionOne;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

/**
 * @property V2V3TestCaseImplementationDescription $description
 * @property (
 *    V2V3TestCaseFunctionZero
 *   |V2V3TestCaseFunctionOne
 * ) $function
 */
trait V2V3TestCaseImplementation
{
    /**
     * @var V2V3TestCaseImplementationDescription $description
     */
    #[JsonProperty('description')]
    public V2V3TestCaseImplementationDescription $description;

    /**
     * @var (
     *    V2V3TestCaseFunctionZero
     *   |V2V3TestCaseFunctionOne
     * ) $function
     */
    #[JsonProperty('function'), Union(V2V3TestCaseFunctionZero::class, V2V3TestCaseFunctionOne::class)]
    public V2V3TestCaseFunctionZero|V2V3TestCaseFunctionOne $function;
}
