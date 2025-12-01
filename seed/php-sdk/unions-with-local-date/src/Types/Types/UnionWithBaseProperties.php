<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Exception;
use Seed\Core\Json\JsonDecoder;

class UnionWithBaseProperties extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var (
     *    'integer'
     *   |'string'
     *   |'foo'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    int
     *   |string
     *   |Foo
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   id: string,
     *   type: (
     *    'integer'
     *   |'string'
     *   |'foo'
     *   |'_unknown'
     * ),
     *   value: (
     *    int
     *   |string
     *   |Foo
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->type = $values['type'];$this->value = $values['value'];
    }

    /**
     * @param string $id
     * @param int $integer
     * @return UnionWithBaseProperties
     */
    public static function integer(string $id, int $integer): UnionWithBaseProperties {
        return new UnionWithBaseProperties([
            'id' => $id,
            'type' => 'integer',
            'value' => $integer,
        ]);
    }

    /**
     * @param string $id
     * @param string $string
     * @return UnionWithBaseProperties
     */
    public static function string(string $id, string $string): UnionWithBaseProperties {
        return new UnionWithBaseProperties([
            'id' => $id,
            'type' => 'string',
            'value' => $string,
        ]);
    }

    /**
     * @param string $id
     * @param Foo $foo
     * @return UnionWithBaseProperties
     */
    public static function foo(string $id, Foo $foo): UnionWithBaseProperties {
        return new UnionWithBaseProperties([
            'id' => $id,
            'type' => 'foo',
            'value' => $foo,
        ]);
    }

    /**
     * @return bool
     */
    public function isInteger(): bool {
        return is_int($this->value)&& $this->type === 'integer';
    }

    /**
     * @return int
     */
    public function asInteger(): int {
        if (!(is_int($this->value)&& $this->type === 'integer')){
            throw new Exception(
                "Expected integer; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
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
    public function isFoo(): bool {
        return $this->value instanceof Foo&& $this->type === 'foo';
    }

    /**
     * @return Foo
     */
    public function asFoo(): Foo {
        if (!($this->value instanceof Foo&& $this->type === 'foo')){
            throw new Exception(
                "Expected foo; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'integer':
                $value = $this->value;
                $result['integer'] = $value;
                break;
            case 'string':
                $value = $this->value;
                $result['string'] = $value;
                break;
            case 'foo':
                $value = $this->asFoo()->jsonSerialize();
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
        if (!array_key_exists('id', $data)){
            throw new Exception(
                "JSON data is missing property 'id'",
            );
        }
        if (!(is_string($data['id']))){
            throw new Exception(
                "Expected property 'id' in JSON data to be string, instead received " . get_debug_type($data['id']),
            );
        }
        $args['id'] = $data['id'];
        
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
            case 'integer':
                if (!array_key_exists('integer', $data)){
                    throw new Exception(
                        "JSON data is missing property 'integer'",
                    );
                }
                
                $args['value'] = $data['integer'];
                break;
            case 'string':
                if (!array_key_exists('string', $data)){
                    throw new Exception(
                        "JSON data is missing property 'string'",
                    );
                }
                
                $args['value'] = $data['string'];
                break;
            case 'foo':
                $args['value'] = Foo::jsonDeserialize($data);
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
