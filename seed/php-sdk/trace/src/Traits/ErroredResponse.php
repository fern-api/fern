<?php

namespace Seed\Traits;

use Seed\Types\ErrorInfoZero;
use Seed\Types\ErrorInfoOne;
use Seed\Types\ErrorInfoTwo;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

/**
 * @property string $submissionId
 * @property (
 *    ErrorInfoZero
 *   |ErrorInfoOne
 *   |ErrorInfoTwo
 * ) $errorInfo
 */
trait ErroredResponse
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @var (
     *    ErrorInfoZero
     *   |ErrorInfoOne
     *   |ErrorInfoTwo
     * ) $errorInfo
     */
    #[JsonProperty('errorInfo'), Union(ErrorInfoZero::class, ErrorInfoOne::class, ErrorInfoTwo::class)]
    public ErrorInfoZero|ErrorInfoOne|ErrorInfoTwo $errorInfo;
}
