# frozen_string_literal: true

require "test_helper"

describe FernSimpleApi::Internal::Types::Boolean do
  describe ".coerce" do
    it "coerces true/false" do
      assert FernSimpleApi::Internal::Types::Boolean.coerce(true)
      refute FernSimpleApi::Internal::Types::Boolean.coerce(false)
    end

    it "coerces an Integer" do
      assert FernSimpleApi::Internal::Types::Boolean.coerce(1)
      refute FernSimpleApi::Internal::Types::Boolean.coerce(0)
    end

    it "coerces a String" do
      assert FernSimpleApi::Internal::Types::Boolean.coerce("1")
      assert FernSimpleApi::Internal::Types::Boolean.coerce("true")
      refute FernSimpleApi::Internal::Types::Boolean.coerce("0")
    end

    it "passes through other values with strictness off" do
      obj = Object.new

      assert_equal obj, FernSimpleApi::Internal::Types::Boolean.coerce(obj)
    end

    it "raises an error with other values with strictness on" do
      assert_raises FernSimpleApi::Internal::Errors::TypeError do
        FernSimpleApi::Internal::Types::Boolean.coerce(Object.new, strict: true)
      end
    end
  end
end
