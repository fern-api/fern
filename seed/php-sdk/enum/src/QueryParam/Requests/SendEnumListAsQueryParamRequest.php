<?php

namespace Seed\QueryParam\Requests;

use Seed\Core\SerializableType;

class SendEnumListAsQueryParamRequest extends SerializableType
{
    /**
     * @var array<string> $operand
     */
    public array $operand;

    /**
     * @var array<?string> $maybeOperand
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
     *   operand: array<string>,
     *   maybeOperand: array<?string>,
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
