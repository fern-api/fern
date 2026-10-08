<?php

namespace Seed\Tests\Xml;

use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
use Seed\Types\Hangup;

class HangupXmlTest extends TestCase
{
    public function testFromXmlToXmlRoundTrips(): void
    {
        $parsed = Hangup::fromXml('<Hangup/>');
        $serialized = $parsed->toXml(false);
        $this->assertSame($serialized, Hangup::fromXml($serialized)->toXml(false));
        $this->assertStringStartsWith('<?xml version="1.0"', $parsed->toXml());
        $this->assertSame($parsed->toXml(), (string) $parsed);
    }

    public function testFromXmlPreservesUnknownAttributesAndChildren(): void
    {
        $parsed = Hangup::fromXml('<Hangup dataUnknown="1"><Unknown a="1">v</Unknown></Hangup>');
        $serialized = $parsed->toXml(false);
        $this->assertStringContainsString('dataUnknown="1"', $serialized);
        $this->assertStringContainsString('<Unknown a="1">v</Unknown>', $serialized);
        $this->assertSame($serialized, Hangup::fromXml($serialized)->toXml(false));
    }

    public function testFromXmlRejectsWrongRootElement(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Hangup::fromXml('<NotTheHangup/>');
    }

    public function testFromXmlRejectsMalformedXml(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Hangup::fromXml('<Hangup><unclosed>');
    }

    public function testFromXmlRejectsDoctype(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Hangup::fromXml('<!DOCTYPE Hangup [<!ENTITY xxe "injected">]><Hangup>&xxe;</Hangup>');
    }
}
