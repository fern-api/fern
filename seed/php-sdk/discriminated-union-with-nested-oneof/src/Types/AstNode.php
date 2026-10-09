<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;

class AstNode extends JsonSerializableType
{
    /**
     * @var (
     *    'llm'
     *   |'text'
     *   |'null_literal'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    AstNodeLlm
     *   |AstTextNode
     *   |AstNullNode
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'llm'
     *   |'text'
     *   |'null_literal'
     *   |'_unknown'
     * ),
     *   value: (
     *    AstNodeLlm
     *   |AstTextNode
     *   |AstNullNode
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'];
    }

    /**
     * @param AstNodeLlm $llm
     * @return AstNode
     */
    public static function llm(AstNodeLlm $llm): AstNode
    {
        return new AstNode([
            'type' => 'llm',
            'value' => $llm,
        ]);
    }

    /**
     * @param AstTextNode $text
     * @return AstNode
     */
    public static function text(AstTextNode $text): AstNode
    {
        return new AstNode([
            'type' => 'text',
            'value' => $text,
        ]);
    }

    /**
     * @param AstNullNode $nullLiteral
     * @return AstNode
     */
    public static function nullLiteral(AstNullNode $nullLiteral): AstNode
    {
        return new AstNode([
            'type' => 'null_literal',
            'value' => $nullLiteral,
        ]);
    }

    /**
     * @return bool
     */
    public function isLlm(): bool
    {
        return $this->value instanceof AstNodeLlm && $this->type === 'llm';
    }

    /**
     * @return AstNodeLlm
     */
    public function asLlm(): AstNodeLlm
    {
        if (!($this->value instanceof AstNodeLlm && $this->type === 'llm')) {
            throw new Exception(
                "Expected llm; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isText(): bool
    {
        return $this->value instanceof AstTextNode && $this->type === 'text';
    }

    /**
     * @return AstTextNode
     */
    public function asText(): AstTextNode
    {
        if (!($this->value instanceof AstTextNode && $this->type === 'text')) {
            throw new Exception(
                "Expected text; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isNullLiteral(): bool
    {
        return $this->value instanceof AstNullNode && $this->type === 'null_literal';
    }

    /**
     * @return AstNullNode
     */
    public function asNullLiteral(): AstNullNode
    {
        if (!($this->value instanceof AstNullNode && $this->type === 'null_literal')) {
            throw new Exception(
                "Expected null_literal; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }

    /**
     * @return array<mixed>
     */
    public function jsonSerialize(): array
    {
        $result = [];
        $result['type'] = $this->type;

        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);

        switch ($this->type) {
            case 'llm':
                $value = $this->asLlm()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'text':
                $value = $this->asText()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'null_literal':
                $value = $this->asNullLiteral()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case '_unknown':
            default:
                if (is_null($this->value)) {
                    break;
                }
                if ($this->value instanceof JsonSerializableType) {
                    $value = $this->value->jsonSerialize();
                    $result = array_merge($value, $result);
                } elseif (is_array($this->value)) {
                    $result = array_merge($this->value, $result);
                }
        }

        return $result;
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function jsonDeserialize(array $data): static
    {
        $args = [];
        if (!array_key_exists('type', $data)) {
            throw new Exception(
                "JSON data is missing property 'type'",
            );
        }
        $type = $data['type'];
        if (!(is_string($type))) {
            throw new Exception(
                "Expected property 'type' in JSON data to be string, instead received " . get_debug_type($data['type']),
            );
        }

        $args['type'] = $type;
        switch ($type) {
            case 'llm':
                $args['value'] = AstNodeLlm::jsonDeserialize($data);
                break;
            case 'text':
                $args['value'] = AstTextNode::jsonDeserialize($data);
                break;
            case 'null_literal':
                $args['value'] = AstNullNode::jsonDeserialize($data);
                break;
            case '_unknown':
            default:
                $args['type'] = '_unknown';
                $args['value'] = $data;
        }

        // @phpstan-ignore-next-line
        return new static($args);
    }
}
