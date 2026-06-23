<?php

namespace Seed\Package\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;

class SipHeaderAction extends JsonSerializableType
{
    /**
     * @var (
     *    'static'
     *   |'dynamic'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    CustomSipHeader
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'static'
     *   |'dynamic'
     *   |'_unknown'
     * ),
     *   value: (
     *    CustomSipHeader
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
     * @param CustomSipHeader $static
     * @return SipHeaderAction
     */
    public static function static(CustomSipHeader $static): SipHeaderAction
    {
        return new SipHeaderAction([
            'type' => 'static',
            'value' => $static,
        ]);
    }

    /**
     * @param CustomSipHeader $dynamic
     * @return SipHeaderAction
     */
    public static function dynamic(CustomSipHeader $dynamic): SipHeaderAction
    {
        return new SipHeaderAction([
            'type' => 'dynamic',
            'value' => $dynamic,
        ]);
    }

    /**
     * @return bool
     */
    public function isStatic_(): bool
    {
        return $this->value instanceof CustomSipHeader && $this->type === 'static';
    }

    /**
     * @return CustomSipHeader
     */
    public function asStatic_(): CustomSipHeader
    {
        if (!($this->value instanceof CustomSipHeader && $this->type === 'static')) {
            throw new Exception(
                "Expected static; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isDynamic(): bool
    {
        return $this->value instanceof CustomSipHeader && $this->type === 'dynamic';
    }

    /**
     * @return CustomSipHeader
     */
    public function asDynamic(): CustomSipHeader
    {
        if (!($this->value instanceof CustomSipHeader && $this->type === 'dynamic')) {
            throw new Exception(
                "Expected dynamic; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'static':
                $value = $this->asStatic_()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'dynamic':
                $value = $this->asDynamic()->jsonSerialize();
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
            case 'static':
                $args['value'] = CustomSipHeader::jsonDeserialize($data);
                break;
            case 'dynamic':
                $args['value'] = CustomSipHeader::jsonDeserialize($data);
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
