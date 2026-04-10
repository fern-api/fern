<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class TraceResponseV2 extends JsonSerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @var int $lineNumber
     */
    #[JsonProperty('lineNumber')]
    public int $lineNumber;

    /**
     * @var TracedFile $file
     */
    #[JsonProperty('file')]
    public TracedFile $file;

    /**
     * @var (
     *    DebugVariableValueZero
     *   |DebugVariableValueOne
     *   |DebugVariableValueTwo
     *   |DebugVariableValueThree
     *   |DebugVariableValueFour
     *   |DebugVariableValueFive
     *   |DebugVariableValueSix
     *   |DebugVariableValueSeven
     *   |DebugVariableValueEight
     *   |DebugVariableValueNine
     *   |DebugVariableValueTen
     *   |DebugVariableValueEleven
     *   |DebugVariableValueTwelve
     * )|null $returnValue
     */
    #[JsonProperty('returnValue'), Union(DebugVariableValueZero::class, DebugVariableValueOne::class, DebugVariableValueTwo::class, DebugVariableValueThree::class, DebugVariableValueFour::class, DebugVariableValueFive::class, DebugVariableValueSix::class, DebugVariableValueSeven::class, DebugVariableValueEight::class, DebugVariableValueNine::class, DebugVariableValueTen::class, DebugVariableValueEleven::class, DebugVariableValueTwelve::class, 'null')]
    public DebugVariableValueZero|DebugVariableValueOne|DebugVariableValueTwo|DebugVariableValueThree|DebugVariableValueFour|DebugVariableValueFive|DebugVariableValueSix|DebugVariableValueSeven|DebugVariableValueEight|DebugVariableValueNine|DebugVariableValueTen|DebugVariableValueEleven|DebugVariableValueTwelve|null $returnValue;

    /**
     * @var ?ExpressionLocation $expressionLocation
     */
    #[JsonProperty('expressionLocation')]
    public ?ExpressionLocation $expressionLocation;

    /**
     * @var StackInformation $stack
     */
    #[JsonProperty('stack')]
    public StackInformation $stack;

    /**
     * @var ?string $stdout
     */
    #[JsonProperty('stdout')]
    public ?string $stdout;

    /**
     * @param array{
     *   submissionId: string,
     *   lineNumber: int,
     *   file: TracedFile,
     *   stack: StackInformation,
     *   returnValue?: (
     *    DebugVariableValueZero
     *   |DebugVariableValueOne
     *   |DebugVariableValueTwo
     *   |DebugVariableValueThree
     *   |DebugVariableValueFour
     *   |DebugVariableValueFive
     *   |DebugVariableValueSix
     *   |DebugVariableValueSeven
     *   |DebugVariableValueEight
     *   |DebugVariableValueNine
     *   |DebugVariableValueTen
     *   |DebugVariableValueEleven
     *   |DebugVariableValueTwelve
     * )|null,
     *   expressionLocation?: ?ExpressionLocation,
     *   stdout?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->lineNumber = $values['lineNumber'];
        $this->file = $values['file'];
        $this->returnValue = $values['returnValue'] ?? null;
        $this->expressionLocation = $values['expressionLocation'] ?? null;
        $this->stack = $values['stack'];
        $this->stdout = $values['stdout'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
