# frozen_string_literal: true

require "test_helper"

describe FernPropertyAccess::Internal::Types::Boolean do
  describe ".coerce" do
    it "coerces true/false" do
      assert FernPropertyAccess::Internal::Types::Boolean.coerce(true)
      refute FernPropertyAccess::Internal::Types::Boolean.coerce(false)
    end

    it "coerces an Integer" do
      assert FernPropertyAccess::Internal::Types::Boolean.coerce(1)
      refute FernPropertyAccess::Internal::Types::Boolean.coerce(0)
    end

    it "coerces a String" do
      assert FernPropertyAccess::Internal::Types::Boolean.coerce("1")
      assert FernPropertyAccess::Internal::Types::Boolean.coerce("true")
      refute FernPropertyAccess::Internal::Types::Boolean.coerce("0")
    end

    it "passes through other values with strictness off" do
      obj = Object.new

      assert_equal obj, FernPropertyAccess::Internal::Types::Boolean.coerce(obj)
    end

    it "raises an error with other values with strictness on" do
      assert_raises FernPropertyAccess::Internal::Errors::TypeError do
        FernPropertyAccess::Internal::Types::Boolean.coerce(Object.new, strict: true)
      end
    end
  end
end
