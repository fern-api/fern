# frozen_string_literal: true

require "test_helper"

describe FernVariables::Internal::Types::Boolean do
  describe ".coerce" do
    it "coerces true/false" do
      assert FernVariables::Internal::Types::Boolean.coerce(true)
      refute FernVariables::Internal::Types::Boolean.coerce(false)
    end

    it "coerces an Integer" do
      assert FernVariables::Internal::Types::Boolean.coerce(1)
      refute FernVariables::Internal::Types::Boolean.coerce(0)
    end

    it "coerces a String" do
      assert FernVariables::Internal::Types::Boolean.coerce("1")
      assert FernVariables::Internal::Types::Boolean.coerce("true")
      refute FernVariables::Internal::Types::Boolean.coerce("0")
    end

    it "passes through other values with strictness off" do
      obj = Object.new

      assert_equal obj, FernVariables::Internal::Types::Boolean.coerce(obj)
    end

    it "raises an error with other values with strictness on" do
      assert_raises FernVariables::Internal::Errors::TypeError do
        FernVariables::Internal::Types::Boolean.coerce(Object.new, strict: true)
      end
    end
  end
end
