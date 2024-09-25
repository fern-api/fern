<?php

namespace Seed\QueryParam\Requests;

use Seed\Core\SerializableType;
use Seed\Types\Operand;

class SendEnumAsQueryParamRequest extends SerializableType
{
    /**
     * @var value-of<Operand> $operand
     */
    public string $operand;

    /**
     * @var ?value-of<Operand> $maybeOperand
     */
    public ?string $maybeOperand;

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
     *   operand: value-of<Operand>,
     *   maybeOperand?: ?value-of<Operand>,
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
