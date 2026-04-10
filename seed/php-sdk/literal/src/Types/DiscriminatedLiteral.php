<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class DiscriminatedLiteral extends JsonSerializableType
{
    /**
     * @var (
     *    'customName'
     *   |'defaultName'
     *   |'george'
     *   |'literalGeorge'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    DiscriminatedLiteralCustomName
     *   |DiscriminatedLiteralDefaultName
     *   |DiscriminatedLiteralGeorge
     *   |DiscriminatedLiteralLiteralGeorge
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'customName'
     *   |'defaultName'
     *   |'george'
     *   |'literalGeorge'
     *   |'_unknown'
     * ),
     *   value: (
     *    DiscriminatedLiteralCustomName
     *   |DiscriminatedLiteralDefaultName
     *   |DiscriminatedLiteralGeorge
     *   |DiscriminatedLiteralLiteralGeorge
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
     * @param DiscriminatedLiteralCustomName $customName
     * @return DiscriminatedLiteral
     */
    public static function customName(DiscriminatedLiteralCustomName $customName): DiscriminatedLiteral
    {
        return new DiscriminatedLiteral([
            'type' => 'customName',
            'value' => $customName,
        ]);
    }

    /**
     * @param DiscriminatedLiteralDefaultName $defaultName
     * @return DiscriminatedLiteral
     */
    public static function defaultName(DiscriminatedLiteralDefaultName $defaultName): DiscriminatedLiteral
    {
        return new DiscriminatedLiteral([
            'type' => 'defaultName',
            'value' => $defaultName,
        ]);
    }

    /**
     * @param DiscriminatedLiteralGeorge $george
     * @return DiscriminatedLiteral
     */
    public static function george(DiscriminatedLiteralGeorge $george): DiscriminatedLiteral
    {
        return new DiscriminatedLiteral([
            'type' => 'george',
            'value' => $george,
        ]);
    }

    /**
     * @param DiscriminatedLiteralLiteralGeorge $literalGeorge
     * @return DiscriminatedLiteral
     */
    public static function literalGeorge(DiscriminatedLiteralLiteralGeorge $literalGeorge): DiscriminatedLiteral
    {
        return new DiscriminatedLiteral([
            'type' => 'literalGeorge',
            'value' => $literalGeorge,
        ]);
    }

    /**
     * @return bool
     */
    public function isCustomName(): bool
    {
        return $this->value instanceof DiscriminatedLiteralCustomName && $this->type === 'customName';
    }

    /**
     * @return DiscriminatedLiteralCustomName
     */
    public function asCustomName(): DiscriminatedLiteralCustomName
    {
        if (!($this->value instanceof DiscriminatedLiteralCustomName && $this->type === 'customName')) {
            throw new Exception(
                "Expected customName; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isDefaultName(): bool
    {
        return $this->value instanceof DiscriminatedLiteralDefaultName && $this->type === 'defaultName';
    }

    /**
     * @return DiscriminatedLiteralDefaultName
     */
    public function asDefaultName(): DiscriminatedLiteralDefaultName
    {
        if (!($this->value instanceof DiscriminatedLiteralDefaultName && $this->type === 'defaultName')) {
            throw new Exception(
                "Expected defaultName; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isGeorge(): bool
    {
        return $this->value instanceof DiscriminatedLiteralGeorge && $this->type === 'george';
    }

    /**
     * @return DiscriminatedLiteralGeorge
     */
    public function asGeorge(): DiscriminatedLiteralGeorge
    {
        if (!($this->value instanceof DiscriminatedLiteralGeorge && $this->type === 'george')) {
            throw new Exception(
                "Expected george; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isLiteralGeorge(): bool
    {
        return $this->value instanceof DiscriminatedLiteralLiteralGeorge && $this->type === 'literalGeorge';
    }

    /**
     * @return DiscriminatedLiteralLiteralGeorge
     */
    public function asLiteralGeorge(): DiscriminatedLiteralLiteralGeorge
    {
        if (!($this->value instanceof DiscriminatedLiteralLiteralGeorge && $this->type === 'literalGeorge')) {
            throw new Exception(
                "Expected literalGeorge; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'customName':
                $value = $this->asCustomName()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'defaultName':
                $value = $this->asDefaultName()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'george':
                $value = $this->asGeorge()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'literalGeorge':
                $value = $this->asLiteralGeorge()->jsonSerialize();
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
            case 'customName':
                $args['value'] = DiscriminatedLiteralCustomName::jsonDeserialize($data);
                break;
            case 'defaultName':
                $args['value'] = DiscriminatedLiteralDefaultName::jsonDeserialize($data);
                break;
            case 'george':
                $args['value'] = DiscriminatedLiteralGeorge::jsonDeserialize($data);
                break;
            case 'literalGeorge':
                $args['value'] = DiscriminatedLiteralLiteralGeorge::jsonDeserialize($data);
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
