<?php

namespace Seed\QueryParam\Requests;

use Seed\Types\Operand;

class SendEnumListAsQueryParamRequest
{
    /**
     * @var array<Operand> $operand
     */
    public array $operand;

    /**
     * @var array<?Operand> $maybeOperand
     */
    public array $maybeOperand;

    /**
     * @var array<mixed> $operandOrColor
     */
    public array $operandOrColor;

    /**
     * @var array<mixed> $maybeOperandOrColor
     */
    public array $maybeOperandOrColor;

}
