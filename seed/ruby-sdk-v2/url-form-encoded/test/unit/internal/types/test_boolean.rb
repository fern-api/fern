# frozen_string_literal: true

require "test_helper"

describe FernUrlFormEncoded::Internal::Types::Boolean do
  describe ".coerce" do
    it "coerces true/false" do
      assert FernUrlFormEncoded::Internal::Types::Boolean.coerce(true)
      refute FernUrlFormEncoded::Internal::Types::Boolean.coerce(false)
    end

    it "coerces an Integer" do
      assert FernUrlFormEncoded::Internal::Types::Boolean.coerce(1)
      refute FernUrlFormEncoded::Internal::Types::Boolean.coerce(0)
    end

    it "coerces a String" do
      assert FernUrlFormEncoded::Internal::Types::Boolean.coerce("1")
      assert FernUrlFormEncoded::Internal::Types::Boolean.coerce("true")
      refute FernUrlFormEncoded::Internal::Types::Boolean.coerce("0")
    end

    it "passes through other values with strictness off" do
      obj = Object.new

      assert_equal obj, FernUrlFormEncoded::Internal::Types::Boolean.coerce(obj)
    end

    it "raises an error with other values with strictness on" do
      assert_raises FernUrlFormEncoded::Internal::Errors::TypeError do
        FernUrlFormEncoded::Internal::Types::Boolean.coerce(Object.new, strict: true)
      end
    end
  end
end
