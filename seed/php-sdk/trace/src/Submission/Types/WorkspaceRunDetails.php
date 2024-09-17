<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Submission\Types\ExceptionInfo;

class WorkspaceRunDetails extends SerializableType
{
    #[JsonProperty("stdout")]
    /**
     * @var string $stdout
     */
    public string $stdout;

    #[JsonProperty("exceptionV2")]
    /**
     * @var mixed $exceptionV2
     */
    public mixed $exceptionV2;

    #[JsonProperty("exception")]
    /**
     * @var ?ExceptionInfo $exception
     */
    public ?ExceptionInfo $exception;

    /**
     * @param string $stdout
     * @param mixed $exceptionV2
     * @param ?ExceptionInfo $exception
     */
    public function __construct(
        string $stdout,
        mixed $exceptionV2,
        ?ExceptionInfo $exception = null,
    ) {
        $this->stdout = $stdout;
        $this->exceptionV2 = $exceptionV2;
        $this->exception = $exception;
    }
}
