# frozen_string_literal: true

require "test_helper"

describe FernLicense::Internal::Types::Boolean do
  describe ".coerce" do
    it "coerces true/false" do
      assert FernLicense::Internal::Types::Boolean.coerce(true)
      refute FernLicense::Internal::Types::Boolean.coerce(false)
    end

    it "coerces an Integer" do
      assert FernLicense::Internal::Types::Boolean.coerce(1)
      refute FernLicense::Internal::Types::Boolean.coerce(0)
    end

    it "coerces a String" do
      assert FernLicense::Internal::Types::Boolean.coerce("1")
      assert FernLicense::Internal::Types::Boolean.coerce("true")
      refute FernLicense::Internal::Types::Boolean.coerce("0")
    end

    it "passes through other values with strictness off" do
      obj = Object.new

      assert_equal obj, FernLicense::Internal::Types::Boolean.coerce(obj)
    end

    it "raises an error with other values with strictness on" do
      assert_raises FernLicense::Internal::Errors::TypeError do
        FernLicense::Internal::Types::Boolean.coerce(Object.new, strict: true)
      end
    end
  end
end
