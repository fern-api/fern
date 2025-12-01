<?php

namespace Seed\NullableOptional\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

/**
 * Discriminated union for testing nullable unions
 */
class NotificationMethod extends JsonSerializableType
{
    /**
     * @var (
     *    'email'
     *   |'sms'
     *   |'push'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    EmailNotification
     *   |SmsNotification
     *   |PushNotification
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'email'
     *   |'sms'
     *   |'push'
     *   |'_unknown'
     * ),
     *   value: (
     *    EmailNotification
     *   |SmsNotification
     *   |PushNotification
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
     * @param EmailNotification $email
     * @return NotificationMethod
     */
    public static function email(EmailNotification $email): NotificationMethod {
        return new NotificationMethod([
            'type' => 'email',
            'value' => $email,
        ]);
    }

    /**
     * @param SmsNotification $sms
     * @return NotificationMethod
     */
    public static function sms(SmsNotification $sms): NotificationMethod {
        return new NotificationMethod([
            'type' => 'sms',
            'value' => $sms,
        ]);
    }

    /**
     * @param PushNotification $push
     * @return NotificationMethod
     */
    public static function push(PushNotification $push): NotificationMethod {
        return new NotificationMethod([
            'type' => 'push',
            'value' => $push,
        ]);
    }

    /**
     * @return bool
     */
    public function isEmail(): bool {
        return $this->value instanceof EmailNotification&& $this->type === 'email';
    }

    /**
     * @return EmailNotification
     */
    public function asEmail(): EmailNotification {
        if (!($this->value instanceof EmailNotification&& $this->type === 'email')){
            throw new Exception(
                "Expected email; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isSms(): bool {
        return $this->value instanceof SmsNotification&& $this->type === 'sms';
    }

    /**
     * @return SmsNotification
     */
    public function asSms(): SmsNotification {
        if (!($this->value instanceof SmsNotification&& $this->type === 'sms')){
            throw new Exception(
                "Expected sms; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isPush(): bool {
        return $this->value instanceof PushNotification&& $this->type === 'push';
    }

    /**
     * @return PushNotification
     */
    public function asPush(): PushNotification {
        if (!($this->value instanceof PushNotification&& $this->type === 'push')){
            throw new Exception(
                "Expected push; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'email':
                $value = $this->asEmail()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'sms':
                $value = $this->asSms()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'push':
                $value = $this->asPush()->jsonSerialize();
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
            case 'email':
                $args['value'] = EmailNotification::jsonDeserialize($data);
                break;
            case 'sms':
                $args['value'] = SmsNotification::jsonDeserialize($data);
                break;
            case 'push':
                $args['value'] = PushNotification::jsonDeserialize($data);
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
