<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class Test extends JsonSerializableType
{
    /**
     * @var (
     *    'and'
     *   |'or'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    bool
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'and'
     *   |'or'
     *   |'_unknown'
     * ),
     *   value: (
     *    bool
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
     * @param bool $and
     * @return Test
     */
    public static function and(bool $and): Test {
        return new Test([
            'type' => 'and',
            'value' => $and,
        ]);
    }

    /**
     * @param bool $or
     * @return Test
     */
    public static function or(bool $or): Test {
        return new Test([
            'type' => 'or',
            'value' => $or,
        ]);
    }

    /**
     * @return bool
     */
    public function isAnd_(): bool {
        return is_bool($this->value)&& $this->type === 'and';
    }

    /**
     * @return bool
     */
    public function asAnd_(): bool {
        if (!(is_bool($this->value)&& $this->type === 'and')){
            throw new Exception(
                "Expected and; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isOr_(): bool {
        return is_bool($this->value)&& $this->type === 'or';
    }

    /**
     * @return bool
     */
    public function asOr_(): bool {
        if (!(is_bool($this->value)&& $this->type === 'or')){
            throw new Exception(
                "Expected or; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'and':
                $value = $this->value;
                $result['and'] = $value;
                break;
            case 'or':
                $value = $this->value;
                $result['or'] = $value;
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
            case 'and':
                if (!array_key_exists('and', $data)){
                    throw new Exception(
                        "JSON data is missing property 'and'",
                    );
                }
                
                $args['value'] = $data['and'];
                break;
            case 'or':
                if (!array_key_exists('or', $data)){
                    throw new Exception(
                        "JSON data is missing property 'or'",
                    );
                }
                
                $args['value'] = $data['or'];
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
