<?php

namespace Seed\Traits;

use Seed\Types\V2TestCaseImplementationDescription;
use Seed\Types\V2TestCaseFunctionZero;
use Seed\Types\V2TestCaseFunctionOne;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

/**
 * @property V2TestCaseImplementationDescription $description
 * @property (
 *    V2TestCaseFunctionZero
 *   |V2TestCaseFunctionOne
 * ) $function
 */
trait V2TestCaseImplementation
{
    /**
     * @var V2TestCaseImplementationDescription $description
     */
    #[JsonProperty('description')]
    public V2TestCaseImplementationDescription $description;

    /**
     * @var (
     *    V2TestCaseFunctionZero
     *   |V2TestCaseFunctionOne
     * ) $function
     */
    #[JsonProperty('function'), Union(V2TestCaseFunctionZero::class, V2TestCaseFunctionOne::class)]
    public V2TestCaseFunctionZero|V2TestCaseFunctionOne $function;
}
