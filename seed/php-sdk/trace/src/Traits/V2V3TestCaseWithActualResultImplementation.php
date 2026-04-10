<?php

namespace Seed\Traits;

use Seed\Types\V2V3NonVoidFunctionDefinition;
use Seed\Types\V2V3AssertCorrectnessCheckZero;
use Seed\Types\V2V3AssertCorrectnessCheckOne;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

/**
 * @property V2V3NonVoidFunctionDefinition $getActualResult
 * @property (
 *    V2V3AssertCorrectnessCheckZero
 *   |V2V3AssertCorrectnessCheckOne
 * ) $assertCorrectnessCheck
 */
trait V2V3TestCaseWithActualResultImplementation
{
    /**
     * @var V2V3NonVoidFunctionDefinition $getActualResult
     */
    #[JsonProperty('getActualResult')]
    public V2V3NonVoidFunctionDefinition $getActualResult;

    /**
     * @var (
     *    V2V3AssertCorrectnessCheckZero
     *   |V2V3AssertCorrectnessCheckOne
     * ) $assertCorrectnessCheck
     */
    #[JsonProperty('assertCorrectnessCheck'), Union(V2V3AssertCorrectnessCheckZero::class, V2V3AssertCorrectnessCheckOne::class)]
    public V2V3AssertCorrectnessCheckZero|V2V3AssertCorrectnessCheckOne $assertCorrectnessCheck;
}
