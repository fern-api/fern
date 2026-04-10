<?php

namespace Seed\Traits;

use Seed\Core\Json\JsonProperty;

/**
 * @property bool $passed
 */
trait TestCaseHiddenGrade
{
    /**
     * @var bool $passed
     */
    #[JsonProperty('passed')]
    public bool $passed;
}
