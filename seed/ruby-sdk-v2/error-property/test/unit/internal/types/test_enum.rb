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

    module StringEnum
      extend Seed::Internal::Types::Enum

      ACTIVE = "ACTIVE"
      CLOSED = "CLOSED"
      GROUP_BY_PROFILE = "GROUP_BY_PROFILE"

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

    it "coerces an existing string member" do
      assert_equal "CLOSED", EnumTest::StringEnum.coerce("CLOSED")
    end

    it "normalizes casing to the wire format" do
      assert_equal "CLOSED", EnumTest::StringEnum.coerce("closed")
      assert_equal "GROUP_BY_PROFILE", EnumTest::StringEnum.coerce("group_by_profile")
    end

    it "coerces a symbol to the string member" do
      assert_equal "CLOSED", EnumTest::StringEnum.coerce(:closed)
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
