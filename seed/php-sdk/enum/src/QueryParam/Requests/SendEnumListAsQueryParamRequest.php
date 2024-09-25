<?php

namespace Seed\QueryParam\Requests;

use Seed\Core\SerializableType;
use Seed\Types\Operand;

class SendEnumListAsQueryParamRequest extends SerializableType
{
    /**
     * @var array<value-of<Operand>> $operand
     */
    public array $operand;

    /**
     * @var array<?value-of<Operand>> $maybeOperand
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
     *   operand: array<value-of<Operand>>,
     *   maybeOperand: array<?value-of<Operand>>,
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
