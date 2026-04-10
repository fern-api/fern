<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

/**
 * Undiscriminated union with multiple object variants.
 * This reproduces the Pipedream issue where Emitter is a union of
 * DeployedComponent, HttpInterface, and TimerInterface.
 */
class MyUnion extends JsonSerializableType
{
    /**
     * @var (
     *    'A'
     *   |'B'
     *   |'C'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    VariantA
     *   |VariantB
     *   |VariantC
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'A'
     *   |'B'
     *   |'C'
     *   |'_unknown'
     * ),
     *   value: (
     *    VariantA
     *   |VariantB
     *   |VariantC
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
     * @param VariantA $a
     * @return MyUnion
     */
    public static function a(VariantA $a): MyUnion
    {
        return new MyUnion([
            'type' => 'A',
            'value' => $a,
        ]);
    }

    /**
     * @param VariantB $b
     * @return MyUnion
     */
    public static function b(VariantB $b): MyUnion
    {
        return new MyUnion([
            'type' => 'B',
            'value' => $b,
        ]);
    }

    /**
     * @param VariantC $c
     * @return MyUnion
     */
    public static function c(VariantC $c): MyUnion
    {
        return new MyUnion([
            'type' => 'C',
            'value' => $c,
        ]);
    }

    /**
     * @return bool
     */
    public function isA(): bool
    {
        return $this->value instanceof VariantA && $this->type === 'A';
    }

    /**
     * @return VariantA
     */
    public function asA(): VariantA
    {
        if (!($this->value instanceof VariantA && $this->type === 'A')) {
            throw new Exception(
                "Expected A; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isB(): bool
    {
        return $this->value instanceof VariantB && $this->type === 'B';
    }

    /**
     * @return VariantB
     */
    public function asB(): VariantB
    {
        if (!($this->value instanceof VariantB && $this->type === 'B')) {
            throw new Exception(
                "Expected B; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isC(): bool
    {
        return $this->value instanceof VariantC && $this->type === 'C';
    }

    /**
     * @return VariantC
     */
    public function asC(): VariantC
    {
        if (!($this->value instanceof VariantC && $this->type === 'C')) {
            throw new Exception(
                "Expected C; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'A':
                $value = $this->asA()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'B':
                $value = $this->asB()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'C':
                $value = $this->asC()->jsonSerialize();
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
     * @param string $json
     */
    public static function fromJson(string $json): static
    {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)) {
            throw new Exception("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
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
            case 'A':
                $args['value'] = VariantA::jsonDeserialize($data);
                break;
            case 'B':
                $args['value'] = VariantB::jsonDeserialize($data);
                break;
            case 'C':
                $args['value'] = VariantC::jsonDeserialize($data);
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
