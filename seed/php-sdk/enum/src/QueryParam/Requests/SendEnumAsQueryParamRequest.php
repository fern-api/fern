<?php

namespace Seed\QueryParam\Requests;

use Seed\Core\SerializableType;
use Seed\Types\Operand;

class SendEnumAsQueryParamRequest extends SerializableType
{
    /**
     * @var string $operand
     */
    public string $operand;

    /**
     * @var ?string $maybeOperand
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
     *   operand: Operand|string,
     *   maybeOperand?: Operand|string|null,
     *   operandOrColor: mixed,
     *   maybeOperandOrColor: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->operand = $values['operand']->value;
        $this->maybeOperand = $values['maybeOperand']?->value ?? null;
        $this->operandOrColor = $values['operandOrColor'];
        $this->maybeOperandOrColor = $values['maybeOperandOrColor'];
    }
}
