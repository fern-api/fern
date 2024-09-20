<?php

namespace Seed\InlinedRequest\Requests;

use Seed\Types\Operand;
use Seed\Core\JsonProperty;

class SendEnumInlinedRequest
{
    /**
     * @var Operand $operand
     */
    #[JsonProperty("operand")]
    public Operand $operand;

    /**
     * @var ?Operand $maybeOperand
     */
    #[JsonProperty("maybeOperand")]
    public ?Operand $maybeOperand;

    /**
     * @var mixed $operandOrColor
     */
    #[JsonProperty("operandOrColor")]
    public mixed $operandOrColor;

    /**
     * @var mixed $maybeOperandOrColor
     */
    #[JsonProperty("maybeOperandOrColor")]
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
