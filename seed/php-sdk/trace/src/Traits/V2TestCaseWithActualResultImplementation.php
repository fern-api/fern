<?php

namespace Seed\Traits;

use Seed\Types\V2NonVoidFunctionDefinition;
use Seed\Types\V2AssertCorrectnessCheckZero;
use Seed\Types\V2AssertCorrectnessCheckOne;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

/**
 * @property V2NonVoidFunctionDefinition $getActualResult
 * @property (
 *    V2AssertCorrectnessCheckZero
 *   |V2AssertCorrectnessCheckOne
 * ) $assertCorrectnessCheck
 */
trait V2TestCaseWithActualResultImplementation
{
    /**
     * @var V2NonVoidFunctionDefinition $getActualResult
     */
    #[JsonProperty('getActualResult')]
    public V2NonVoidFunctionDefinition $getActualResult;

    /**
     * @var (
     *    V2AssertCorrectnessCheckZero
     *   |V2AssertCorrectnessCheckOne
     * ) $assertCorrectnessCheck
     */
    #[JsonProperty('assertCorrectnessCheck'), Union(V2AssertCorrectnessCheckZero::class, V2AssertCorrectnessCheckOne::class)]
    public V2AssertCorrectnessCheckZero|V2AssertCorrectnessCheckOne $assertCorrectnessCheck;
}
