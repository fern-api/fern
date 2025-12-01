<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class UnionWithSubTypes extends JsonSerializableType
{
    /**
     * @var (
     *    'foo'
     *   |'fooExtended'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    Foo
     *   |FooExtended
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'foo'
     *   |'fooExtended'
     *   |'_unknown'
     * ),
     *   value: (
     *    Foo
     *   |FooExtended
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
     * @param Foo $foo
     * @return UnionWithSubTypes
     */
    public static function foo(Foo $foo): UnionWithSubTypes {
        return new UnionWithSubTypes([
            'type' => 'foo',
            'value' => $foo,
        ]);
    }

    /**
     * @param FooExtended $fooExtended
     * @return UnionWithSubTypes
     */
    public static function fooExtended(FooExtended $fooExtended): UnionWithSubTypes {
        return new UnionWithSubTypes([
            'type' => 'fooExtended',
            'value' => $fooExtended,
        ]);
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
     * @return bool
     */
    public function isFooExtended(): bool {
        return $this->value instanceof FooExtended&& $this->type === 'fooExtended';
    }

    /**
     * @return FooExtended
     */
    public function asFooExtended(): FooExtended {
        if (!($this->value instanceof FooExtended&& $this->type === 'fooExtended')){
            throw new Exception(
                "Expected fooExtended; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'foo':
                $value = $this->asFoo()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'fooExtended':
                $value = $this->asFooExtended()->jsonSerialize();
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
            case 'foo':
                $args['value'] = Foo::jsonDeserialize($data);
                break;
            case 'fooExtended':
                $args['value'] = FooExtended::jsonDeserialize($data);
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
