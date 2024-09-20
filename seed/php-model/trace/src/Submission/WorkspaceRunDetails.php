<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class WorkspaceRunDetails extends SerializableType
{
    /**
     * @var mixed $exceptionV2
     */
    #[JsonProperty("exceptionV2")]
    public mixed $exceptionV2;

    /**
     * @var ?ExceptionInfo $exception
     */
    #[JsonProperty("exception")]
    public ?ExceptionInfo $exception;

    /**
     * @var string $stdout
     */
    #[JsonProperty("stdout")]
    public string $stdout;

    /**
     * @param array{
     *   exceptionV2: mixed,
     *   exception?: ?ExceptionInfo,
     *   stdout: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->exceptionV2 = $values['exceptionV2'];
        $this->exception = $values['exception'] ?? null;
        $this->stdout = $values['stdout'];
    }
}
