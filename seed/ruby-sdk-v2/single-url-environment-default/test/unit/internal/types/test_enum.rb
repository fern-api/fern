# frozen_string_literal: true

require "test_helper"

describe Seed::Internal::Types::Enum do
  module EnumTest
    module ExampleEnum
      extend Seed::Internal::Types::Enum

      FOO = :foo
      BAR = :bar

      finalize!
    end
  end

  describe "#values" do
    it "defines values" do
      assert_equal %i[foo bar].sort, EnumTest::ExampleEnum.values.sort
    end
  end

  describe "#coerce" do
    it "coerces an existing member" do
      assert_equal :foo, EnumTest::ExampleEnum.coerce(:foo)
    end

    it "coerces a string version of a member" do
      assert_equal :foo, EnumTest::ExampleEnum.coerce("foo")
    end

    it "returns the value if not a member with strictness off" do
      assert_equal 1, EnumTest::ExampleEnum.coerce(1)
    end

    it "raises an error if value is not a member with strictness on" do
      assert_raises Seed::Internal::Errors::TypeError do
        EnumTest::ExampleEnum.coerce(1, strict: true)
      end
    end
  end
end
