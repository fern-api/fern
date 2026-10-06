<?php

namespace Seed\Tests\Xml;

use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
use Seed\Types\Dial;

class DialXmlTest extends TestCase
{
    public function testFromXmlToXmlRoundTrips(): void
    {
        $parsed = Dial::fromXml('<tw:Dial xmlns:tw="https://www.twilio.com/twiml" statusCallbackEvent="statusCallbackEvent statusCallbackEvent-2" record="record-from-answer record-from-ringing"><Numbers><Number/></Numbers></tw:Dial>');
        $this->assertSame(['statusCallbackEvent', 'statusCallbackEvent-2'], $parsed->statusCallbackEvent);
        $this->assertSame(['record-from-answer', 'record-from-ringing'], $parsed->record);
        $serialized = $parsed->toXml(false);
        $this->assertStringContainsString('statusCallbackEvent="statusCallbackEvent statusCallbackEvent-2"', $serialized);
        $this->assertStringContainsString('record="record-from-answer record-from-ringing"', $serialized);
        $this->assertSame($serialized, Dial::fromXml($serialized)->toXml(false));
        $this->assertStringStartsWith('<?xml version="1.0"', $parsed->toXml());
        $this->assertSame($parsed->toXml(), (string) $parsed);
    }

    public function testFromXmlPreservesUnknownAttributesAndChildren(): void
    {
        $parsed = Dial::fromXml('<tw:Dial xmlns:tw="https://www.twilio.com/twiml" dataUnknown="1"><Unknown a="1">v</Unknown></tw:Dial>');
        $serialized = $parsed->toXml(false);
        $this->assertStringContainsString('dataUnknown="1"', $serialized);
        $this->assertStringContainsString('<Unknown a="1">v</Unknown>', $serialized);
        $this->assertSame($serialized, Dial::fromXml($serialized)->toXml(false));
    }

    public function testFromXmlRejectsWrongRootElement(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Dial::fromXml('<NotThetw:Dial/>');
    }

    public function testFromXmlRejectsMalformedXml(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Dial::fromXml('<tw:Dial><unclosed>');
    }

    public function testFromXmlRejectsDoctype(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Dial::fromXml('<!DOCTYPE tw:Dial [<!ENTITY xxe "injected">]><tw:Dial xmlns:tw="https://www.twilio.com/twiml">&xxe;</tw:Dial>');
    }
}
