# frozen_string_literal: true

require "test_helper"

describe FernAudiences::Internal::Types::Boolean do
  describe ".coerce" do
    it "coerces true/false" do
      assert FernAudiences::Internal::Types::Boolean.coerce(true)
      refute FernAudiences::Internal::Types::Boolean.coerce(false)
    end

    it "coerces an Integer" do
      assert FernAudiences::Internal::Types::Boolean.coerce(1)
      refute FernAudiences::Internal::Types::Boolean.coerce(0)
    end

    it "coerces a String" do
      assert FernAudiences::Internal::Types::Boolean.coerce("1")
      assert FernAudiences::Internal::Types::Boolean.coerce("true")
      refute FernAudiences::Internal::Types::Boolean.coerce("0")
    end

    it "passes through other values with strictness off" do
      obj = Object.new

      assert_equal obj, FernAudiences::Internal::Types::Boolean.coerce(obj)
    end

    it "raises an error with other values with strictness on" do
      assert_raises FernAudiences::Internal::Errors::TypeError do
        FernAudiences::Internal::Types::Boolean.coerce(Object.new, strict: true)
      end
    end
  end
end
