# frozen_string_literal: true

require "test_helper"

describe FernAcceptHeader::Internal::Types::Boolean do
  describe ".coerce" do
    it "coerces true/false" do
      assert FernAcceptHeader::Internal::Types::Boolean.coerce(true)
      refute FernAcceptHeader::Internal::Types::Boolean.coerce(false)
    end

    it "coerces an Integer" do
      assert FernAcceptHeader::Internal::Types::Boolean.coerce(1)
      refute FernAcceptHeader::Internal::Types::Boolean.coerce(0)
    end

    it "coerces a String" do
      assert FernAcceptHeader::Internal::Types::Boolean.coerce("1")
      assert FernAcceptHeader::Internal::Types::Boolean.coerce("true")
      refute FernAcceptHeader::Internal::Types::Boolean.coerce("0")
    end

    it "passes through other values with strictness off" do
      obj = Object.new

      assert_equal obj, FernAcceptHeader::Internal::Types::Boolean.coerce(obj)
    end

    it "raises an error with other values with strictness on" do
      assert_raises FernAcceptHeader::Internal::Errors::TypeError do
        FernAcceptHeader::Internal::Types::Boolean.coerce(Object.new, strict: true)
      end
    end
  end
end
