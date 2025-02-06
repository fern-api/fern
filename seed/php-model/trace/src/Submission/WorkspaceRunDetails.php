<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class WorkspaceRunDetails extends JsonSerializableType
{
    /**
     * @var mixed $exceptionV2
     */
    #[JsonProperty('exceptionV2')]
    public mixed $exceptionV2;

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

    /**
     * @param array{
     *   exceptionV2?: mixed,
     *   exception?: ?ExceptionInfo,
     *   stdout: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->exceptionV2 = $values['exceptionV2'] ?? null;
        $this->exception = $values['exception'] ?? null;
        $this->stdout = $values['stdout'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
