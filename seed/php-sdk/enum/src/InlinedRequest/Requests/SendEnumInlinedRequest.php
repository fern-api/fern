<?php

namespace Seed\InlinedRequest\Requests;

use Seed\Core\Json\SerializableType;
use Seed\Types\Operand;
use Seed\Core\Json\JsonProperty;
use Seed\Types\Color;

class SendEnumInlinedRequest extends SerializableType
{
    /**
     * @var value-of<Operand> $operand
     */
    #[JsonProperty('operand')]
    public string $operand;

    /**
     * @var ?value-of<Operand> $maybeOperand
     */
    #[JsonProperty('maybeOperand')]
    public ?string $maybeOperand;

    /**
     * @var value-of<Color>|value-of<Operand> $operandOrColor
     */
    #[JsonProperty('operandOrColor')]
    public string $operandOrColor;

    /**
     * @var value-of<Color>|value-of<Operand>|null $maybeOperandOrColor
     */
    #[JsonProperty('maybeOperandOrColor')]
    public string|null $maybeOperandOrColor;

    /**
     * @param array{
     *   operand: value-of<Operand>,
     *   maybeOperand?: ?value-of<Operand>,
     *   operandOrColor: value-of<Color>|value-of<Operand>,
     *   maybeOperandOrColor?: value-of<Color>|value-of<Operand>|null,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->operand = $values['operand'];
        $this->maybeOperand = $values['maybeOperand'] ?? null;
        $this->operandOrColor = $values['operandOrColor'];
        $this->maybeOperandOrColor = $values['maybeOperandOrColor'] ?? null;
    }
}
