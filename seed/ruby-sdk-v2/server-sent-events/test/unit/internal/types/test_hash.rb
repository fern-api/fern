# frozen_string_literal: true

require "test_helper"

describe Seed::Internal::Types::Hash do
  module TestHash
    SymbolStringHash = Seed::Internal::Types::Hash[Symbol, String]
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
