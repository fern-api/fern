<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class ExceptionV2 extends JsonSerializableType
{
    /**
     * @var (
     *    'generic'
     *   |'timeout'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    ExceptionInfo
     *   |null
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'generic'
     *   |'timeout'
     *   |'_unknown'
     * ),
     *   value: (
     *    ExceptionInfo
     *   |null
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
     * @param ExceptionInfo $generic
     * @return ExceptionV2
     */
    public static function generic(ExceptionInfo $generic): ExceptionV2 {
        return new ExceptionV2([
            'type' => 'generic',
            'value' => $generic,
        ]);
    }

    /**
     * @return ExceptionV2
     */
    public static function timeout(): ExceptionV2 {
        return new ExceptionV2([
            'type' => 'timeout',
            'value' => null,
        ]);
    }

    /**
     * @return bool
     */
    public function isGeneric(): bool {
        return $this->value instanceof ExceptionInfo&& $this->type === 'generic';
    }

    /**
     * @return ExceptionInfo
     */
    public function asGeneric(): ExceptionInfo {
        if (!($this->value instanceof ExceptionInfo&& $this->type === 'generic')){
            throw new Exception(
                "Expected generic; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isTimeout(): bool {
        return is_null($this->value)&& $this->type === 'timeout';
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
            case 'generic':
                $value = $this->asGeneric()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'timeout':
                $result['timeout'] = [];
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
            case 'generic':
                $args['value'] = ExceptionInfo::jsonDeserialize($data);
                break;
            case 'timeout':
                $args['value'] = null;
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
