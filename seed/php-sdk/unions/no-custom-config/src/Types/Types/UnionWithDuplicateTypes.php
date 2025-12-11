<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class UnionWithDuplicateTypes extends JsonSerializableType
{
    /**
     * @var (
     *    'foo1'
     *   |'foo2'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    Foo
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'foo1'
     *   |'foo2'
     *   |'_unknown'
     * ),
     *   value: (
     *    Foo
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
     * @param Foo $foo1
     * @return UnionWithDuplicateTypes
     */
    public static function foo1(Foo $foo1): UnionWithDuplicateTypes {
        return new UnionWithDuplicateTypes([
            'type' => 'foo1',
            'value' => $foo1,
        ]);
    }

    /**
     * @param Foo $foo2
     * @return UnionWithDuplicateTypes
     */
    public static function foo2(Foo $foo2): UnionWithDuplicateTypes {
        return new UnionWithDuplicateTypes([
            'type' => 'foo2',
            'value' => $foo2,
        ]);
    }

    /**
     * @return bool
     */
    public function isFoo1(): bool {
        return $this->value instanceof Foo&& $this->type === 'foo1';
    }

    /**
     * @return Foo
     */
    public function asFoo1(): Foo {
        if (!($this->value instanceof Foo&& $this->type === 'foo1')){
            throw new Exception(
                "Expected foo1; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isFoo2(): bool {
        return $this->value instanceof Foo&& $this->type === 'foo2';
    }

    /**
     * @return Foo
     */
    public function asFoo2(): Foo {
        if (!($this->value instanceof Foo&& $this->type === 'foo2')){
            throw new Exception(
                "Expected foo2; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'foo1':
                $value = $this->asFoo1()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'foo2':
                $value = $this->asFoo2()->jsonSerialize();
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
            case 'foo1':
                $args['value'] = Foo::jsonDeserialize($data);
                break;
            case 'foo2':
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
