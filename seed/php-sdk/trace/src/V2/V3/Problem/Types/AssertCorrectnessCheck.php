<?php

namespace Seed\V2\V3\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class AssertCorrectnessCheck extends JsonSerializableType
{
    /**
     * @var (
     *    'deepEquality'
     *   |'custom'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    DeepEqualityCorrectnessCheck
     *   |VoidFunctionDefinitionThatTakesActualResult
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'deepEquality'
     *   |'custom'
     *   |'_unknown'
     * ),
     *   value: (
     *    DeepEqualityCorrectnessCheck
     *   |VoidFunctionDefinitionThatTakesActualResult
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    )
    {
        $this->type = $values['type'];$this->value = $values['value'];
    }

    /**
     * @param DeepEqualityCorrectnessCheck $deepEquality
     * @return AssertCorrectnessCheck
     */
    public static function deepEquality(DeepEqualityCorrectnessCheck $deepEquality): AssertCorrectnessCheck {
        return new AssertCorrectnessCheck([
            'type' => 'deepEquality',
            'value' => $deepEquality,
        ]);
    }

    /**
     * @param VoidFunctionDefinitionThatTakesActualResult $custom
     * @return AssertCorrectnessCheck
     */
    public static function custom(VoidFunctionDefinitionThatTakesActualResult $custom): AssertCorrectnessCheck {
        return new AssertCorrectnessCheck([
            'type' => 'custom',
            'value' => $custom,
        ]);
    }

    /**
     * @return bool
     */
    public function isDeepEquality(): bool {
        return $this->value instanceof DeepEqualityCorrectnessCheck&& $this->type === 'deepEquality';
    }

    /**
     * @return DeepEqualityCorrectnessCheck
     */
    public function asDeepEquality(): DeepEqualityCorrectnessCheck {
        if (!($this->value instanceof DeepEqualityCorrectnessCheck&& $this->type === 'deepEquality')){
            throw new Exception(
                "Expected deepEquality; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isCustom(): bool {
        return $this->value instanceof VoidFunctionDefinitionThatTakesActualResult&& $this->type === 'custom';
    }

    /**
     * @return VoidFunctionDefinitionThatTakesActualResult
     */
    public function asCustom(): VoidFunctionDefinitionThatTakesActualResult {
        if (!($this->value instanceof VoidFunctionDefinitionThatTakesActualResult&& $this->type === 'custom')){
            throw new Exception(
                "Expected custom; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }

    /**
     * @return array<mixed>
     */
    public function jsonSerialize(): array {
        $result = [];
        $result['type'] = $this->type;
        
        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);
        
        switch ($this->type){
            case 'deepEquality':
                $value = $this->asDeepEquality()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'custom':
                $value = $this->asCustom()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case '_unknown':
            default:
                if (is_null($this->value)){
                    break;
                }
                if ($this->value instanceof JsonSerializableType){
                    $value = $this->value->jsonSerialize();
                    $result = array_merge($value, $result);
                } elseif (is_array($this->value)){
                    $result = array_merge($this->value, $result);
                }
        }
        
        return $result;
    }

    /**
     * @param string $json
     */
    public static function fromJson(string $json): static {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)){
            throw new Exception("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function jsonDeserialize(array $data): static {
        $args = [];
        if (!array_key_exists('type', $data)){
            throw new Exception(
                "JSON data is missing property 'type'",
            );
        }
        $type = $data['type'];
        if (!(is_string($type))){
            throw new Exception(
                "Expected property 'type' in JSON data to be string, instead received " . get_debug_type($data['type']),
            );
        }
        
        $args['type'] = $type;
        switch ($type){
            case 'deepEquality':
                $args['value'] = DeepEqualityCorrectnessCheck::jsonDeserialize($data);
                break;
            case 'custom':
                $args['value'] = VoidFunctionDefinitionThatTakesActualResult::jsonDeserialize($data);
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
