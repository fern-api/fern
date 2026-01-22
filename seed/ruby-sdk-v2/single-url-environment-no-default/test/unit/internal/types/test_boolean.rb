# frozen_string_literal: true

require "test_helper"

describe FernSingleUrlEnvironmentNoDefault::Internal::Types::Boolean do
  describe ".coerce" do
    it "coerces true/false" do
      assert FernSingleUrlEnvironmentNoDefault::Internal::Types::Boolean.coerce(true)
      refute FernSingleUrlEnvironmentNoDefault::Internal::Types::Boolean.coerce(false)
    end

    it "coerces an Integer" do
      assert FernSingleUrlEnvironmentNoDefault::Internal::Types::Boolean.coerce(1)
      refute FernSingleUrlEnvironmentNoDefault::Internal::Types::Boolean.coerce(0)
    end

    it "coerces a String" do
      assert FernSingleUrlEnvironmentNoDefault::Internal::Types::Boolean.coerce("1")
      assert FernSingleUrlEnvironmentNoDefault::Internal::Types::Boolean.coerce("true")
      refute FernSingleUrlEnvironmentNoDefault::Internal::Types::Boolean.coerce("0")
    end

    it "passes through other values with strictness off" do
      obj = Object.new

      assert_equal obj, FernSingleUrlEnvironmentNoDefault::Internal::Types::Boolean.coerce(obj)
    end

    it "raises an error with other values with strictness on" do
      assert_raises FernSingleUrlEnvironmentNoDefault::Internal::Errors::TypeError do
        FernSingleUrlEnvironmentNoDefault::Internal::Types::Boolean.coerce(Object.new, strict: true)
      end
    end
  end
end
