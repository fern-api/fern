<?php

namespace Seed\InlinedRequest\Requests;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Types\Operand;

class SendEnumInlinedRequest extends SerializableType
{
    /**
     * @var string $operand
     */
    #[JsonProperty('operand')]
    public string $operand;

    /**
     * @var ?string $maybeOperand
     */
    #[JsonProperty('maybeOperand')]
    public ?string $maybeOperand;

    /**
     * @var mixed $operandOrColor
     */
    #[JsonProperty('operandOrColor')]
    public mixed $operandOrColor;

    /**
     * @var mixed $maybeOperandOrColor
     */
    #[JsonProperty('maybeOperandOrColor')]
    public mixed $maybeOperandOrColor;

    /**
     * @param array{
     *   operand: Operand|string,
     *   maybeOperand?: Operand|string|null,
     *   operandOrColor: mixed,
     *   maybeOperandOrColor: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->operand = $values['operand']->value;
        $this->maybeOperand = $values['maybeOperand']?->value ?? null;
        $this->operandOrColor = $values['operandOrColor'];
        $this->maybeOperandOrColor = $values['maybeOperandOrColor'];
    }
}
