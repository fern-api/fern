<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class TraceResponseV2 extends SerializableType
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
     * @var TracedFile $file
     */
    #[JsonProperty("file")]
    public TracedFile $file;

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
     * @param TracedFile $file
     * @param mixed $returnValue
     * @param StackInformation $stack
     * @param ?ExpressionLocation $expressionLocation
     * @param ?string $stdout
     */
    public function __construct(
        string $submissionId,
        int $lineNumber,
        TracedFile $file,
        mixed $returnValue,
        StackInformation $stack,
        ?ExpressionLocation $expressionLocation = null,
        ?string $stdout = null,
    ) {
        $this->submissionId = $submissionId;
        $this->lineNumber = $lineNumber;
        $this->file = $file;
        $this->returnValue = $returnValue;
        $this->stack = $stack;
        $this->expressionLocation = $expressionLocation;
        $this->stdout = $stdout;
    }
}
