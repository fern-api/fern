<?php

namespace Seed\Submission\Types;

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
     * @var string $stdout
     */
    #[JsonProperty("stdout")]
    public string $stdout;

    /**
     * @var ?ExceptionInfo $exception
     */
    #[JsonProperty("exception")]
    public ?ExceptionInfo $exception;

    /**
     * @param mixed $exceptionV2
     * @param string $stdout
     * @param ?ExceptionInfo $exception
     */
    public function __construct(
        mixed $exceptionV2,
        string $stdout,
        ?ExceptionInfo $exception = null,
    ) {
        $this->exceptionV2 = $exceptionV2;
        $this->stdout = $stdout;
        $this->exception = $exception;
    }
}
