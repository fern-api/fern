<?php

namespace Seed\Commons\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class Data extends JsonSerializableType
{
    /**
     * @var (
     *    'string'
     *   |'base64'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    string
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'string'
     *   |'base64'
     *   |'_unknown'
     * ),
     *   value: (
     *    string
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
     * @param string $string
     * @return Data
     */
    public static function string(string $string): Data {
        return new Data([
            'type' => 'string',
            'value' => $string,
        ]);
    }

    /**
     * @param string $base64
     * @return Data
     */
    public static function base64(string $base64): Data {
        return new Data([
            'type' => 'base64',
            'value' => $base64,
        ]);
    }

    /**
     * @return bool
     */
    public function isString(): bool {
        return is_string($this->value)&& $this->type === 'string';
    }

    /**
     * @return string
     */
    public function asString(): string {
        if (!(is_string($this->value)&& $this->type === 'string')){
            throw new Exception(
                "Expected string; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isBase64(): bool {
        return is_string($this->value)&& $this->type === 'base64';
    }

    /**
     * @return string
     */
    public function asBase64(): string {
        if (!(is_string($this->value)&& $this->type === 'base64')){
            throw new Exception(
                "Expected base64; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'string':
                $value = $this->value;
                $result['string'] = $value;
                break;
            case 'base64':
                $value = $this->value;
                $result['base64'] = $value;
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
            case 'string':
                if (!array_key_exists('string', $data)){
                    throw new Exception(
                        "JSON data is missing property 'string'",
                    );
                }
                
                $args['value'] = $data['string'];
                break;
            case 'base64':
                if (!array_key_exists('base64', $data)){
                    throw new Exception(
                        "JSON data is missing property 'base64'",
                    );
                }
                
                $args['value'] = $data['base64'];
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
