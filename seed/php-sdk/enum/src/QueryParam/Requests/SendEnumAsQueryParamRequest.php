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

    /**
     * @param array{
     *   operand: Operand,
     *   maybeOperand?: ?Operand,
     *   operandOrColor: mixed,
     *   maybeOperandOrColor: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->operand = $values['operand'];
        $this->maybeOperand = $values['maybeOperand'] ?? null;
        $this->operandOrColor = $values['operandOrColor'];
        $this->maybeOperandOrColor = $values['maybeOperandOrColor'];
    }
}
