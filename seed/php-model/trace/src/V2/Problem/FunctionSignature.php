<?php

namespace Seed\V2\Problem;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class FunctionSignature extends JsonSerializableType
{
    /**
     * @var (
     *    'void'
     *   |'nonVoid'
     *   |'voidThatTakesActualResult'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    VoidFunctionSignature
     *   |NonVoidFunctionSignature
     *   |VoidFunctionSignatureThatTakesActualResult
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'void'
     *   |'nonVoid'
     *   |'voidThatTakesActualResult'
     *   |'_unknown'
     * ),
     *   value: (
     *    VoidFunctionSignature
     *   |NonVoidFunctionSignature
     *   |VoidFunctionSignatureThatTakesActualResult
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
     * @param VoidFunctionSignature $void
     * @return FunctionSignature
     */
    public static function void(VoidFunctionSignature $void): FunctionSignature {
        return new FunctionSignature([
            'type' => 'void',
            'value' => $void,
        ]);
    }

    /**
     * @param NonVoidFunctionSignature $nonVoid
     * @return FunctionSignature
     */
    public static function nonVoid(NonVoidFunctionSignature $nonVoid): FunctionSignature {
        return new FunctionSignature([
            'type' => 'nonVoid',
            'value' => $nonVoid,
        ]);
    }

    /**
     * @param VoidFunctionSignatureThatTakesActualResult $voidThatTakesActualResult
     * @return FunctionSignature
     */
    public static function voidThatTakesActualResult(VoidFunctionSignatureThatTakesActualResult $voidThatTakesActualResult): FunctionSignature {
        return new FunctionSignature([
            'type' => 'voidThatTakesActualResult',
            'value' => $voidThatTakesActualResult,
        ]);
    }

    /**
     * @return bool
     */
    public function isVoid(): bool {
        return $this->value instanceof VoidFunctionSignature&& $this->type === 'void';
    }

    /**
     * @return VoidFunctionSignature
     */
    public function asVoid(): VoidFunctionSignature {
        if (!($this->value instanceof VoidFunctionSignature&& $this->type === 'void')){
            throw new Exception(
                "Expected void; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isNonVoid(): bool {
        return $this->value instanceof NonVoidFunctionSignature&& $this->type === 'nonVoid';
    }

    /**
     * @return NonVoidFunctionSignature
     */
    public function asNonVoid(): NonVoidFunctionSignature {
        if (!($this->value instanceof NonVoidFunctionSignature&& $this->type === 'nonVoid')){
            throw new Exception(
                "Expected nonVoid; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isVoidThatTakesActualResult(): bool {
        return $this->value instanceof VoidFunctionSignatureThatTakesActualResult&& $this->type === 'voidThatTakesActualResult';
    }

    /**
     * @return VoidFunctionSignatureThatTakesActualResult
     */
    public function asVoidThatTakesActualResult(): VoidFunctionSignatureThatTakesActualResult {
        if (!($this->value instanceof VoidFunctionSignatureThatTakesActualResult&& $this->type === 'voidThatTakesActualResult')){
            throw new Exception(
                "Expected voidThatTakesActualResult; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'void':
                $value = $this->asVoid()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'nonVoid':
                $value = $this->asNonVoid()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'voidThatTakesActualResult':
                $value = $this->asVoidThatTakesActualResult()->jsonSerialize();
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
            case 'void':
                $args['value'] = VoidFunctionSignature::jsonDeserialize($data);
                break;
            case 'nonVoid':
                $args['value'] = NonVoidFunctionSignature::jsonDeserialize($data);
                break;
            case 'voidThatTakesActualResult':
                $args['value'] = VoidFunctionSignatureThatTakesActualResult::jsonDeserialize($data);
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
