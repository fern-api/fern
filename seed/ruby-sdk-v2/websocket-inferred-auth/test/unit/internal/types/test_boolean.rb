# frozen_string_literal: true

require "test_helper"

describe FernWebsocketInferredAuth::Internal::Types::Boolean do
  describe ".coerce" do
    it "coerces true/false" do
      assert FernWebsocketInferredAuth::Internal::Types::Boolean.coerce(true)
      refute FernWebsocketInferredAuth::Internal::Types::Boolean.coerce(false)
    end

    it "coerces an Integer" do
      assert FernWebsocketInferredAuth::Internal::Types::Boolean.coerce(1)
      refute FernWebsocketInferredAuth::Internal::Types::Boolean.coerce(0)
    end

    it "coerces a String" do
      assert FernWebsocketInferredAuth::Internal::Types::Boolean.coerce("1")
      assert FernWebsocketInferredAuth::Internal::Types::Boolean.coerce("true")
      refute FernWebsocketInferredAuth::Internal::Types::Boolean.coerce("0")
    end

    it "passes through other values with strictness off" do
      obj = Object.new

      assert_equal obj, FernWebsocketInferredAuth::Internal::Types::Boolean.coerce(obj)
    end

    it "raises an error with other values with strictness on" do
      assert_raises FernWebsocketInferredAuth::Internal::Errors::TypeError do
        FernWebsocketInferredAuth::Internal::Types::Boolean.coerce(Object.new, strict: true)
      end
    end
  end
end
