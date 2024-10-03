<?php

namespace Seed\QueryParam\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\Operand;
use Seed\Types\Color;

class SendEnumListAsQueryParamRequest extends JsonSerializableType
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
     * @var array<value-of<Color>|value-of<Operand>> $operandOrColor
     */
    public array $operandOrColor;

    /**
     * @var array<value-of<Color>|value-of<Operand>|null> $maybeOperandOrColor
     */
    public array $maybeOperandOrColor;

    /**
     * @param array{
     *   operand: array<value-of<Operand>>,
     *   maybeOperand: array<?value-of<Operand>>,
     *   operandOrColor: array<value-of<Color>|value-of<Operand>>,
     *   maybeOperandOrColor: array<value-of<Color>|value-of<Operand>|null>,
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
