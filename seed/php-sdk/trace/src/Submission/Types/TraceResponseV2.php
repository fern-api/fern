<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Submission\Types\TracedFile;
use Seed\Submission\Types\StackInformation;
use Seed\Submission\Types\ExpressionLocation;

class TraceResponseV2 extends SerializableType
{
    #[JsonProperty("submissionId")]
    /**
     * @var string $submissionId
     */
    public string $submissionId;

    #[JsonProperty("lineNumber")]
    /**
     * @var int $lineNumber
     */
    public int $lineNumber;

    #[JsonProperty("file")]
    /**
     * @var TracedFile $file
     */
    public TracedFile $file;

    #[JsonProperty("stack")]
    /**
     * @var StackInformation $stack
     */
    public StackInformation $stack;

    #[JsonProperty("returnValue")]
    /**
     * @var mixed $returnValue
     */
    public mixed $returnValue;

    #[JsonProperty("expressionLocation")]
    /**
     * @var ?ExpressionLocation $expressionLocation
     */
    public ?ExpressionLocation $expressionLocation;

    #[JsonProperty("stdout")]
    /**
     * @var ?string $stdout
     */
    public ?string $stdout;

    /**
     * @param string $submissionId
     * @param int $lineNumber
     * @param TracedFile $file
     * @param StackInformation $stack
     * @param mixed $returnValue
     * @param ?ExpressionLocation $expressionLocation
     * @param ?string $stdout
     */
    public function __construct(
        string $submissionId,
        int $lineNumber,
        TracedFile $file,
        StackInformation $stack,
        mixed $returnValue,
        ?ExpressionLocation $expressionLocation = null,
        ?string $stdout = null,
    ) {
        $this->submissionId = $submissionId;
        $this->lineNumber = $lineNumber;
        $this->file = $file;
        $this->stack = $stack;
        $this->returnValue = $returnValue;
        $this->expressionLocation = $expressionLocation;
        $this->stdout = $stdout;
    }
}
