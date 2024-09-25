<?php

namespace Seed\InlinedRequest\Requests;

use Seed\Core\SerializableType;
use Seed\Types\Operand;
use Seed\Core\JsonProperty;

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
     * @var mixed $operandOrColor
     */
    #[JsonProperty('operandOrColor')]
    public mixed $operandOrColor;

    /**
     * @var mixed $maybeOperandOrColor
     */
    #[JsonProperty('maybeOperandOrColor')]
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
