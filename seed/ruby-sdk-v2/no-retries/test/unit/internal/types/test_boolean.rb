# frozen_string_literal: true

require "test_helper"

describe FernNoRetries::Internal::Types::Boolean do
  describe ".coerce" do
    it "coerces true/false" do
      assert FernNoRetries::Internal::Types::Boolean.coerce(true)
      refute FernNoRetries::Internal::Types::Boolean.coerce(false)
    end

    it "coerces an Integer" do
      assert FernNoRetries::Internal::Types::Boolean.coerce(1)
      refute FernNoRetries::Internal::Types::Boolean.coerce(0)
    end

    it "coerces a String" do
      assert FernNoRetries::Internal::Types::Boolean.coerce("1")
      assert FernNoRetries::Internal::Types::Boolean.coerce("true")
      refute FernNoRetries::Internal::Types::Boolean.coerce("0")
    end

    it "passes through other values with strictness off" do
      obj = Object.new

      assert_equal obj, FernNoRetries::Internal::Types::Boolean.coerce(obj)
    end

    it "raises an error with other values with strictness on" do
      assert_raises FernNoRetries::Internal::Errors::TypeError do
        FernNoRetries::Internal::Types::Boolean.coerce(Object.new, strict: true)
      end
    end
  end
end
