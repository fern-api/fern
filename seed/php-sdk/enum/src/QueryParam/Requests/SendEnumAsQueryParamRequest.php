<?php

namespace Seed\QueryParam\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\Operand;
use Seed\Types\Color;

class SendEnumAsQueryParamRequest extends JsonSerializableType
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
     * @var (
     *    value-of<Color>
     *   |value-of<Operand>
     * ) $operandOrColor
     */
    public string $operandOrColor;

    /**
     * @var (
     *    value-of<Color>
     *   |value-of<Operand>
     * )|null $maybeOperandOrColor
     */
    public string|null $maybeOperandOrColor;

    /**
     * @param array{
     *   operand: value-of<Operand>,
     *   operandOrColor: (
     *    value-of<Color>
     *   |value-of<Operand>
     * ),
     *   maybeOperand?: ?value-of<Operand>,
     *   maybeOperandOrColor?: (
     *    value-of<Color>
     *   |value-of<Operand>
     * )|null,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->operand = $values['operand'];$this->maybeOperand = $values['maybeOperand'] ?? null;$this->operandOrColor = $values['operandOrColor'];$this->maybeOperandOrColor = $values['maybeOperandOrColor'] ?? null;
    }
}
