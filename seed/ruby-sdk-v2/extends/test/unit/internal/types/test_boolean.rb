# frozen_string_literal: true

require "test_helper"

describe FernExtends::Internal::Types::Boolean do
  describe ".coerce" do
    it "coerces true/false" do
      assert FernExtends::Internal::Types::Boolean.coerce(true)
      refute FernExtends::Internal::Types::Boolean.coerce(false)
    end

    it "coerces an Integer" do
      assert FernExtends::Internal::Types::Boolean.coerce(1)
      refute FernExtends::Internal::Types::Boolean.coerce(0)
    end

    it "coerces a String" do
      assert FernExtends::Internal::Types::Boolean.coerce("1")
      assert FernExtends::Internal::Types::Boolean.coerce("true")
      refute FernExtends::Internal::Types::Boolean.coerce("0")
    end

    it "passes through other values with strictness off" do
      obj = Object.new

      assert_equal obj, FernExtends::Internal::Types::Boolean.coerce(obj)
    end

    it "raises an error with other values with strictness on" do
      assert_raises FernExtends::Internal::Errors::TypeError do
        FernExtends::Internal::Types::Boolean.coerce(Object.new, strict: true)
      end
    end
  end
end
