<?php

namespace Seed\QueryParam\Requests;

use Seed\Types\Operand;

class SendEnumAsQueryParamRequest
{
    /**
     * @var Operand $operand
     */
    public Operand $operand;

    /**
     * @var mixed $operandOrColor
     */
    public mixed $operandOrColor;

    /**
     * @var mixed $maybeOperandOrColor
     */
    public mixed $maybeOperandOrColor;

    /**
     * @var ?Operand $maybeOperand
     */
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
