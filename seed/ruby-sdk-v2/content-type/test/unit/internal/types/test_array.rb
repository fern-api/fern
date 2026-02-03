# frozen_string_literal: true

require "test_helper"

describe Seed::Internal::Types::Array do
  module TestArray
    StringArray = Seed::Internal::Types::Array[String]
  end

  describe "#initialize" do
    it "sets the type" do
      assert_equal String, TestArray::StringArray.type
    end
  end

  describe "#coerce" do
    it "does not perform coercion if not an array" do
      assert_equal 1, TestArray::StringArray.coerce(1)
    end

    it "raises an error if not an array and strictness is on" do
      assert_raises Seed::Internal::Errors::TypeError do
        TestArray::StringArray.coerce(1, strict: true)
      end
    end

    it "coerces the elements" do
      assert_equal %w[foobar 1 true], TestArray::StringArray.coerce(["foobar", 1, true])
    end

    it "raises an error if element of array is not coercable and strictness is on" do
      assert_raises Seed::Internal::Errors::TypeError do
        TestArray::StringArray.coerce([Object.new], strict: true)
      end
    end
  end
end
