# frozen_string_literal: true

require "test_helper"

describe Seed::Internal::Types::Hash do
  module TestHash
    SymbolStringHash = Seed::Internal::Types::Hash[Symbol, String]
    IntegerStringHash = Seed::Internal::Types::Hash[Integer, String]
    FloatIntegerHash = Seed::Internal::Types::Hash[Float, Integer]
  end

  describe ".[]" do
    it "defines the key and value type" do
      assert_equal Symbol, TestHash::SymbolStringHash.key_type
      assert_equal String, TestHash::SymbolStringHash.value_type
    end
  end

  describe "#coerce" do
    it "coerces the keys" do
      assert_equal %i[foo bar], TestHash::SymbolStringHash.coerce({ "foo" => "1", :bar => "2" }).keys
    end

    it "coerces numeric keys parsed as symbols from JSON" do
      assert_equal [1, 20], TestHash::IntegerStringHash.coerce(JSON.parse('{"1":"a","20":"b"}', symbolize_names: true)).keys
      assert_equal [1.5, 0.0425], TestHash::FloatIntegerHash.coerce(JSON.parse('{"1.5":1,"0.0425":2}', symbolize_names: true)).keys
    end

    it "coerces the values" do
      assert_equal %w[foo 1], TestHash::SymbolStringHash.coerce({ foo: :foo, bar: 1 }).values
    end

    it "passes through other values with strictness off" do
      obj = Object.new

      assert_equal obj, TestHash::SymbolStringHash.coerce(obj)
    end

    it "raises an error with other values with strictness on" do
      assert_raises Seed::Internal::Errors::TypeError do
        TestHash::SymbolStringHash.coerce(Object.new, strict: true)
      end
    end

    it "raises an error with non-coercable key types with strictness on" do
      assert_raises Seed::Internal::Errors::TypeError do
        TestHash::SymbolStringHash.coerce({ Object.new => 1 }, strict: true)
      end
    end

    it "raises an error with non-coercable value types with strictness on" do
      assert_raises Seed::Internal::Errors::TypeError do
        TestHash::SymbolStringHash.coerce({ "foobar" => Object.new }, strict: true)
      end
    end
  end
end
