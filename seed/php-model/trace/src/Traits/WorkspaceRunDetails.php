<?php

namespace Seed\Traits;

use Seed\ExceptionV2Zero;
use Seed\ExceptionV2Type;
use Seed\ExceptionInfo;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

/**
 * @property (
 *    ExceptionV2Zero
 *   |ExceptionV2Type
 * )|null $exceptionV2
 * @property ?ExceptionInfo $exception
 * @property string $stdout
 */
trait WorkspaceRunDetails
{
    /**
     * @var (
     *    ExceptionV2Zero
     *   |ExceptionV2Type
     * )|null $exceptionV2
     */
    #[JsonProperty('exceptionV2'), Union(ExceptionV2Zero::class, ExceptionV2Type::class, 'null')]
    public ExceptionV2Zero|ExceptionV2Type|null $exceptionV2;

    /**
     * @var ?ExceptionInfo $exception
     */
    #[JsonProperty('exception')]
    public ?ExceptionInfo $exception;

    /**
     * @var string $stdout
     */
    #[JsonProperty('stdout')]
    public string $stdout;
}
