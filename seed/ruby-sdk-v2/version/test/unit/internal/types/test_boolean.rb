# frozen_string_literal: true

require "test_helper"

describe FernVersion::Internal::Types::Boolean do
  describe ".coerce" do
    it "coerces true/false" do
      assert FernVersion::Internal::Types::Boolean.coerce(true)
      refute FernVersion::Internal::Types::Boolean.coerce(false)
    end

    it "coerces an Integer" do
      assert FernVersion::Internal::Types::Boolean.coerce(1)
      refute FernVersion::Internal::Types::Boolean.coerce(0)
    end

    it "coerces a String" do
      assert FernVersion::Internal::Types::Boolean.coerce("1")
      assert FernVersion::Internal::Types::Boolean.coerce("true")
      refute FernVersion::Internal::Types::Boolean.coerce("0")
    end

    it "passes through other values with strictness off" do
      obj = Object.new

      assert_equal obj, FernVersion::Internal::Types::Boolean.coerce(obj)
    end

    it "raises an error with other values with strictness on" do
      assert_raises FernVersion::Internal::Errors::TypeError do
        FernVersion::Internal::Types::Boolean.coerce(Object.new, strict: true)
      end
    end
  end
end
