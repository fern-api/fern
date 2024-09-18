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

    /**
     * @param array<Operand> $operand
     * @param array<?Operand> $maybeOperand
     * @param array<mixed> $operandOrColor
     * @param array<mixed> $maybeOperandOrColor
     */
    public function __construct(
        array $operand,
        array $maybeOperand,
        array $operandOrColor,
        array $maybeOperandOrColor,
    ) {
        $this->operand = $operand;
        $this->maybeOperand = $maybeOperand;
        $this->operandOrColor = $operandOrColor;
        $this->maybeOperandOrColor = $maybeOperandOrColor;
    }
}
