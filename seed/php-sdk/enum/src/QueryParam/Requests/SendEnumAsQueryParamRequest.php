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
     * @var ?Operand $maybeOperand
     */
    public ?Operand $maybeOperand;

    /**
     * @var mixed $operandOrColor
     */
    public mixed $operandOrColor;

    /**
     * @var mixed $maybeOperandOrColor
     */
    public mixed $maybeOperandOrColor;

}
