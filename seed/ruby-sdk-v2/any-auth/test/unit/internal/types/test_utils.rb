# frozen_string_literal: true

require "test_helper"

describe Seed::Internal::Types::Utils do
  Utils = Seed::Internal::Types::Utils

  module TestUtils
    class M < Seed::Internal::Types::Model
      field :value, String
    end

    class UnionMemberA < Seed::Internal::Types::Model
      literal :type, "A"
      field :only_on_a, String
    end

    class UnionMemberB < Seed::Internal::Types::Model
      literal :type, "B"
      field :only_on_b, String
    end

    module U
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { UnionMemberA }, key: "A"
      member -> { UnionMemberB }, key: "B"
    end

    SymbolStringHash = Seed::Internal::Types::Hash[Symbol, String]
    SymbolModelHash = -> { Seed::Internal::Types::Hash[Symbol, TestUtils::M] }
  end

  describe ".coerce" do
    describe "NilClass" do
      it "always returns nil" do
        assert_nil Utils.coerce(NilClass, "foobar")
        assert_nil Utils.coerce(NilClass, 1)
        assert_nil Utils.coerce(NilClass, Object.new)
      end
    end

    describe "String" do
      it "coerces from String, Symbol, Numeric, or Boolean" do
        assert_equal "foobar", Utils.coerce(String, "foobar")
        assert_equal "foobar", Utils.coerce(String, :foobar)
        assert_equal "1", Utils.coerce(String, 1)
        assert_equal "1.0", Utils.coerce(String, 1.0)
        assert_equal "true", Utils.coerce(String, true)
      end

      it "passes through value if it cannot be coerced and not strict" do
        obj = Object.new

        assert_equal obj, Utils.coerce(String, obj)
      end

      it "raises an error if value cannot be coerced and strict" do
        assert_raises Seed::Internal::Errors::TypeError do
          Utils.coerce(String, Object.new, strict: true)
        end
      end
    end

    describe "Symbol" do
      it "coerces from Symbol, String" do
        assert_equal :foobar, Utils.coerce(Symbol, :foobar)
        assert_equal :foobar, Utils.coerce(Symbol, "foobar")
      end

      it "passes through value if it cannot be coerced and not strict" do
        obj = Object.new

        assert_equal obj, Utils.coerce(Symbol, obj)
      end

      it "raises an error if value cannot be coerced and strict" do
        assert_raises Seed::Internal::Errors::TypeError do
          Utils.coerce(Symbol, Object.new, strict: true)
        end
      end
    end

    describe "Integer" do
      it "coerces from Numeric, String, Time" do
        assert_equal 1, Utils.coerce(Integer, 1)
        assert_equal 1, Utils.coerce(Integer, 1.0)
        assert_equal 1, Utils.coerce(Integer, Complex.rect(1))
        assert_equal 1, Utils.coerce(Integer, Rational(1))
        assert_equal 1, Utils.coerce(Integer, "1")
        assert_equal 1_713_916_800, Utils.coerce(Integer, Time.utc(2024, 4, 24))
      end

      it "passes through value if it cannot be coerced and not strict" do
        obj = Object.new

        assert_equal obj, Utils.coerce(Integer, obj)
      end

      it "raises an error if value cannot be coerced and strict" do
        assert_raises Seed::Internal::Errors::TypeError do
          Utils.coerce(Integer, Object.new, strict: true)
        end
      end
    end

    describe "Float" do
      it "coerces from Numeric, Time" do
        assert_in_delta(1.0, Utils.coerce(Float, 1.0))
        assert_in_delta(1.0, Utils.coerce(Float, 1))
        assert_in_delta(1.0, Utils.coerce(Float, Complex.rect(1)))
        assert_in_delta(1.0, Utils.coerce(Float, Rational(1)))
        assert_in_delta(1_713_916_800.0, Utils.coerce(Integer, Time.utc(2024, 4, 24)))
      end

      it "passes through value if it cannot be coerced and not strict" do
        obj = Object.new

        assert_equal obj, Utils.coerce(Float, obj)
      end

      it "raises an error if value cannot be coerced and strict" do
        assert_raises Seed::Internal::Errors::TypeError do
          Utils.coerce(Float, Object.new, strict: true)
        end
      end
    end

    describe "Model" do
      it "coerces a hash" do
        result = Utils.coerce(TestUtils::M, { value: "foobar" })

        assert_kind_of TestUtils::M, result
        assert_equal "foobar", result.value
      end

      it "coerces a hash when the target is a type function" do
        result = Utils.coerce(-> { TestUtils::M }, { value: "foobar" })

        assert_kind_of TestUtils::M, result
        assert_equal "foobar", result.value
      end

      it "will not coerce non-hashes" do
        assert_equal "foobar", Utils.coerce(TestUtils::M, "foobar")
      end
    end

    describe "Enum" do
      module ExampleEnum
        extend Seed::Internal::Types::Enum

        FOO = :FOO
        BAR = :BAR

        finalize!
      end

      it "coerces into a Symbol version of the member value" do
        assert_equal :FOO, Utils.coerce(ExampleEnum, "FOO")
      end

      it "returns given value if not a member" do
        assert_equal "NOPE", Utils.coerce(ExampleEnum, "NOPE")
      end
    end

    describe "Array" do
      StringArray = Seed::Internal::Types::Array[String]
      ModelArray = -> { Seed::Internal::Types::Array[TestUtils::M] }
      UnionArray = -> { Seed::Internal::Types::Array[TestUtils::U] }

      it "coerces an array of literals" do
        assert_equal %w[a b c], Utils.coerce(StringArray, %w[a b c])
        assert_equal ["1", "2.0", "true"], Utils.coerce(StringArray, [1, 2.0, true])
        assert_equal ["1", "2.0", "true"], Utils.coerce(StringArray, Set.new([1, 2.0, true]))
      end

      it "coerces an array of Models" do
        assert_equal [TestUtils::M.new(value: "foobar"), TestUtils::M.new(value: "bizbaz")],
                     Utils.coerce(ModelArray, [{ value: "foobar" }, { value: "bizbaz" }])

        assert_equal [TestUtils::M.new(value: "foobar"), TestUtils::M.new(value: "bizbaz")],
                     Utils.coerce(ModelArray, [TestUtils::M.new(value: "foobar"), TestUtils::M.new(value: "bizbaz")])
      end

      it "coerces an array of model unions" do
        assert_equal [TestUtils::UnionMemberA.new(type: "A", only_on_a: "A"), TestUtils::UnionMemberB.new(type: "B", only_on_b: "B")],
                     Utils.coerce(UnionArray, [{ type: "A", only_on_a: "A" }, { type: "B", only_on_b: "B" }])
      end

      it "returns given value if not an array" do
        assert_equal 1, Utils.coerce(StringArray, 1)
      end
    end

    describe "Hash" do
      it "coerces the keys and values" do
        ssh_res = Utils.coerce(TestUtils::SymbolStringHash, { "foo" => "bar", "biz" => "2" })

        assert_equal "bar", ssh_res[:foo]
        assert_equal "2", ssh_res[:biz]

        smh_res = Utils.coerce(TestUtils::SymbolModelHash, { "foo" => { "value" => "foo" } })

        assert_equal TestUtils::M.new(value: "foo"), smh_res[:foo]
      end
    end
  end
end
