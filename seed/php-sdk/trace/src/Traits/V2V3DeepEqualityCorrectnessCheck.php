<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property string $expectedValueParameterId
 */
trait V2V3DeepEqualityCorrectnessCheck
{
    /**
     * @var string $expectedValueParameterId
     */
    #[JsonProperty('expectedValueParameterId')]
    public string $expectedValueParameterId;
}
