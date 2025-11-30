<?php

namespace Seed\InlinedRequest\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\Operand;
use Seed\Core\Json\JsonProperty;
use Seed\Types\Color;
use Seed\Core\Types\Union;

class SendEnumInlinedRequest extends JsonSerializableType
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
     * @var (
     *    value-of<Color>
     *   |value-of<Operand>
     * ) $operandOrColor
     */
    #[JsonProperty('operandOrColor')]
    public string $operandOrColor;

    /**
     * @var (
     *    value-of<Color>
     *   |value-of<Operand>
     * )|null $maybeOperandOrColor
     */
    #[JsonProperty('maybeOperandOrColor'), Union('string','null')]
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
