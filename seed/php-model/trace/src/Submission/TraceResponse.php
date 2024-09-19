<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TraceResponse extends SerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty("submissionId")]
    public string $submissionId;

    /**
     * @var int $lineNumber
     */
    #[JsonProperty("lineNumber")]
    public int $lineNumber;

    /**
     * @var mixed $returnValue
     */
    #[JsonProperty("returnValue")]
    public mixed $returnValue;

    /**
     * @var StackInformation $stack
     */
    #[JsonProperty("stack")]
    public StackInformation $stack;

    /**
     * @var ?ExpressionLocation $expressionLocation
     */
    #[JsonProperty("expressionLocation")]
    public ?ExpressionLocation $expressionLocation;

    /**
     * @var ?string $stdout
     */
    #[JsonProperty("stdout")]
    public ?string $stdout;

    /**
     * @param string $submissionId
     * @param int $lineNumber
     * @param mixed $returnValue
     * @param StackInformation $stack
     * @param ?ExpressionLocation $expressionLocation
     * @param ?string $stdout
     */
    public function __construct(
        string $submissionId,
        int $lineNumber,
        mixed $returnValue,
        StackInformation $stack,
        ?ExpressionLocation $expressionLocation = null,
        ?string $stdout = null,
    ) {
        $this->submissionId = $submissionId;
        $this->lineNumber = $lineNumber;
        $this->returnValue = $returnValue;
        $this->stack = $stack;
        $this->expressionLocation = $expressionLocation;
        $this->stdout = $stdout;
    }
}
