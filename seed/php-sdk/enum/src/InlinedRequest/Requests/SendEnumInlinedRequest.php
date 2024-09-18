<?php

namespace Seed\InlinedRequest\Requests;

use Seed\Types\Operand;
use Seed\Core\JsonProperty;

class SendEnumInlinedRequest
{
    /**
     * @var Operand $operand
     */
    #[JsonProperty("operand")]
    public Operand $operand;

    /**
     * @var mixed $operandOrColor
     */
    #[JsonProperty("operandOrColor")]
    public mixed $operandOrColor;

    /**
     * @var mixed $maybeOperandOrColor
     */
    #[JsonProperty("maybeOperandOrColor")]
    public mixed $maybeOperandOrColor;

    /**
     * @var ?Operand $maybeOperand
     */
    #[JsonProperty("maybeOperand")]
    public ?Operand $maybeOperand;

    /**
     * @param Operand $operand
     * @param mixed $operandOrColor
     * @param mixed $maybeOperandOrColor
     * @param ?Operand $maybeOperand
     */
    public function __construct(
        Operand $operand,
        mixed $operandOrColor,
        mixed $maybeOperandOrColor,
        ?Operand $maybeOperand = null,
    ) {
        $this->operand = $operand;
        $this->operandOrColor = $operandOrColor;
        $this->maybeOperandOrColor = $maybeOperandOrColor;
        $this->maybeOperand = $maybeOperand;
    }
}
