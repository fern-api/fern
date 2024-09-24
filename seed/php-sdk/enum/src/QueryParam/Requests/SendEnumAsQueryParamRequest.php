<?php

namespace Seed\QueryParam\Requests;

use Seed\Types\Operand;

class SendEnumAsQueryParamRequest
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
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->operand = $values['operand'];
//        $this->maybeOperand = $values['maybeOperand'] ?? null;
//        $this->operandOrColor = $values['operandOrColor'];
//        $this->maybeOperandOrColor = $values['maybeOperandOrColor'];
    }

    public function boop(): void {
        $this->__construct(["operand" => ">"]);
    }
}
