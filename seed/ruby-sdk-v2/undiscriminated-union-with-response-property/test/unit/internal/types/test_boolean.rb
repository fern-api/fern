# frozen_string_literal: true

require "test_helper"

describe FernUndiscriminatedUnionWithResponseProperty::Internal::Types::Boolean do
  describe ".coerce" do
    it "coerces true/false" do
      assert FernUndiscriminatedUnionWithResponseProperty::Internal::Types::Boolean.coerce(true)
      refute FernUndiscriminatedUnionWithResponseProperty::Internal::Types::Boolean.coerce(false)
    end

    it "coerces an Integer" do
      assert FernUndiscriminatedUnionWithResponseProperty::Internal::Types::Boolean.coerce(1)
      refute FernUndiscriminatedUnionWithResponseProperty::Internal::Types::Boolean.coerce(0)
    end

    it "coerces a String" do
      assert FernUndiscriminatedUnionWithResponseProperty::Internal::Types::Boolean.coerce("1")
      assert FernUndiscriminatedUnionWithResponseProperty::Internal::Types::Boolean.coerce("true")
      refute FernUndiscriminatedUnionWithResponseProperty::Internal::Types::Boolean.coerce("0")
    end

    it "passes through other values with strictness off" do
      obj = Object.new

      assert_equal obj, FernUndiscriminatedUnionWithResponseProperty::Internal::Types::Boolean.coerce(obj)
    end

    it "raises an error with other values with strictness on" do
      assert_raises FernUndiscriminatedUnionWithResponseProperty::Internal::Errors::TypeError do
        FernUndiscriminatedUnionWithResponseProperty::Internal::Types::Boolean.coerce(Object.new, strict: true)
      end
    end
  end
end
