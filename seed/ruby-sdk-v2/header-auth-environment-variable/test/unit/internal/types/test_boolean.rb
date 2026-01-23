# frozen_string_literal: true

require "test_helper"

describe FernHeaderAuthEnvironmentVariable::Internal::Types::Boolean do
  describe ".coerce" do
    it "coerces true/false" do
      assert FernHeaderAuthEnvironmentVariable::Internal::Types::Boolean.coerce(true)
      refute FernHeaderAuthEnvironmentVariable::Internal::Types::Boolean.coerce(false)
    end

    it "coerces an Integer" do
      assert FernHeaderAuthEnvironmentVariable::Internal::Types::Boolean.coerce(1)
      refute FernHeaderAuthEnvironmentVariable::Internal::Types::Boolean.coerce(0)
    end

    it "coerces a String" do
      assert FernHeaderAuthEnvironmentVariable::Internal::Types::Boolean.coerce("1")
      assert FernHeaderAuthEnvironmentVariable::Internal::Types::Boolean.coerce("true")
      refute FernHeaderAuthEnvironmentVariable::Internal::Types::Boolean.coerce("0")
    end

    it "passes through other values with strictness off" do
      obj = Object.new

      assert_equal obj, FernHeaderAuthEnvironmentVariable::Internal::Types::Boolean.coerce(obj)
    end

    it "raises an error with other values with strictness on" do
      assert_raises FernHeaderAuthEnvironmentVariable::Internal::Errors::TypeError do
        FernHeaderAuthEnvironmentVariable::Internal::Types::Boolean.coerce(Object.new, strict: true)
      end
    end
  end
end
