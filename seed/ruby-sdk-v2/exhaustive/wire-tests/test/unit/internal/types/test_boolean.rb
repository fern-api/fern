# frozen_string_literal: true

require "test_helper"

describe FernExhaustive::Internal::Types::Boolean do
  describe ".coerce" do
    it "coerces true/false" do
      assert FernExhaustive::Internal::Types::Boolean.coerce(true)
      refute FernExhaustive::Internal::Types::Boolean.coerce(false)
    end

    it "coerces an Integer" do
      assert FernExhaustive::Internal::Types::Boolean.coerce(1)
      refute FernExhaustive::Internal::Types::Boolean.coerce(0)
    end

    it "coerces a String" do
      assert FernExhaustive::Internal::Types::Boolean.coerce("1")
      assert FernExhaustive::Internal::Types::Boolean.coerce("true")
      refute FernExhaustive::Internal::Types::Boolean.coerce("0")
    end

    it "passes through other values with strictness off" do
      obj = Object.new

      assert_equal obj, FernExhaustive::Internal::Types::Boolean.coerce(obj)
    end

    it "raises an error with other values with strictness on" do
      assert_raises FernExhaustive::Internal::Errors::TypeError do
        FernExhaustive::Internal::Types::Boolean.coerce(Object.new, strict: true)
      end
    end
  end
end
