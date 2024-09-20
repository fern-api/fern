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
     * @param array{
     *   operand: array<Operand>,
     *   maybeOperand: array<?Operand>,
     *   operandOrColor: array<mixed>,
     *   maybeOperandOrColor: array<mixed>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->operand = $values['operand'];
        $this->maybeOperand = $values['maybeOperand'];
        $this->operandOrColor = $values['operandOrColor'];
        $this->maybeOperandOrColor = $values['maybeOperandOrColor'];
    }
}
