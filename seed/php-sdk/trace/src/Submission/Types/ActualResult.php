<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Commons\Types\VariableValue;
use Exception;
use Seed\Core\Json\JsonDecoder;

class ActualResult extends JsonSerializableType
{
    /**
     * @var (
     *    'value'
     *   |'exception'
     *   |'exceptionV2'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    VariableValue
     *   |ExceptionInfo
     *   |ExceptionV2
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'value'
     *   |'exception'
     *   |'exceptionV2'
     *   |'_unknown'
     * ),
     *   value: (
     *    VariableValue
     *   |ExceptionInfo
     *   |ExceptionV2
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
     * @param VariableValue $value
     * @return ActualResult
     */
    public static function value(VariableValue $value): ActualResult {
        return new ActualResult([
            'type' => 'value',
            'value' => $value,
        ]);
    }

    /**
     * @param ExceptionInfo $exception
     * @return ActualResult
     */
    public static function exception(ExceptionInfo $exception): ActualResult {
        return new ActualResult([
            'type' => 'exception',
            'value' => $exception,
        ]);
    }

    /**
     * @param ExceptionV2 $exceptionV2
     * @return ActualResult
     */
    public static function exceptionV2(ExceptionV2 $exceptionV2): ActualResult {
        return new ActualResult([
            'type' => 'exceptionV2',
            'value' => $exceptionV2,
        ]);
    }

    /**
     * @return bool
     */
    public function isValue(): bool {
        return $this->value instanceof VariableValue&& $this->type === 'value';
    }

    /**
     * @return VariableValue
     */
    public function asValue(): VariableValue {
        if (!($this->value instanceof VariableValue&& $this->type === 'value')){
            throw new Exception(
                "Expected value; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isException(): bool {
        return $this->value instanceof ExceptionInfo&& $this->type === 'exception';
    }

    /**
     * @return ExceptionInfo
     */
    public function asException(): ExceptionInfo {
        if (!($this->value instanceof ExceptionInfo&& $this->type === 'exception')){
            throw new Exception(
                "Expected exception; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isExceptionV2(): bool {
        return $this->value instanceof ExceptionV2&& $this->type === 'exceptionV2';
    }

    /**
     * @return ExceptionV2
     */
    public function asExceptionV2(): ExceptionV2 {
        if (!($this->value instanceof ExceptionV2&& $this->type === 'exceptionV2')){
            throw new Exception(
                "Expected exceptionV2; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'value':
                $value = $this->asValue()->jsonSerialize();
                $result['value'] = $value;
                break;
            case 'exception':
                $value = $this->asException()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'exceptionV2':
                $value = $this->asExceptionV2()->jsonSerialize();
                $result['exceptionV2'] = $value;
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
            case 'value':
                if (!array_key_exists('value', $data)){
                    throw new Exception(
                        "JSON data is missing property 'value'",
                    );
                }
                
                if (!(is_array($data['value']))){
                    throw new Exception(
                        "Expected property 'value' in JSON data to be array, instead received " . get_debug_type($data['value']),
                    );
                }
                $args['value'] = VariableValue::jsonDeserialize($data['value']);
                break;
            case 'exception':
                $args['value'] = ExceptionInfo::jsonDeserialize($data);
                break;
            case 'exceptionV2':
                if (!array_key_exists('exceptionV2', $data)){
                    throw new Exception(
                        "JSON data is missing property 'exceptionV2'",
                    );
                }
                
                if (!(is_array($data['exceptionV2']))){
                    throw new Exception(
                        "Expected property 'exceptionV2' in JSON data to be array, instead received " . get_debug_type($data['exceptionV2']),
                    );
                }
                $args['value'] = ExceptionV2::jsonDeserialize($data['exceptionV2']);
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
