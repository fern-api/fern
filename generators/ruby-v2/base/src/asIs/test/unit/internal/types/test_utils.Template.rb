# frozen_string_literal: true

require "test_helper"

describe <%= gem_namespace %>::Internal::Types::Utils do
  Utils = <%= gem_namespace %>::Internal::Types::Utils

  module TestUtils
    class M < <%= gem_namespace %>::Internal::Types::Model
      field :value, String
    end

    class UnionMemberA < <%= gem_namespace %>::Internal::Types::Model
      literal :type, "A"
      field :only_on_a, String
    end

    class UnionMemberB < <%= gem_namespace %>::Internal::Types::Model
      literal :type, "B"
      field :only_on_b, String
    end

    module U
      extend <%= gem_namespace %>::Internal::Types::Union

      discriminant :type

      member -> { UnionMemberA }, key: "A"
      member -> { UnionMemberB }, key: "B"
    end

    SymbolStringHash = <%= gem_namespace %>::Internal::Types::Hash[Symbol, String]
    SymbolModelHash = -> { <%= gem_namespace %>::Internal::Types::Hash[Symbol, TestUtils::M] }
  end

<% if (preserveIntegerInputs) { %>  class NumericInput < <%= gem_namespace %>::Internal::Types::Model
    field :amount, Float
    field :numbers, <%= gem_namespace %>::Internal::Types::Array[Float], optional: true
    field :mapping, <%= gem_namespace %>::Internal::Types::Hash[String, Float], optional: true
    field :preserve_integer_values, String, optional: true
  end

  module NumericUnion
    extend <%= gem_namespace %>::Internal::Types::Union

    member -> { NumericInput }
  end

  class NestedNumericInput < <%= gem_namespace %>::Internal::Types::Model
    field :child, NumericInput
    field :children, <%= gem_namespace %>::Internal::Types::Array[NumericInput]
    field :mapping, <%= gem_namespace %>::Internal::Types::Hash[String, NumericInput]
    field :union, NumericUnion
  end

  describe "integer request inputs" do
    it "preserves integers through nested models, arrays, maps and unions" do
      amount = (2**80) + 1
      child = { amount: amount, numbers: [amount, 1.25], mapping: { "value" => amount } }
      input = { child: child, children: [child], mapping: { "item" => child }, union: child }
      before = Marshal.dump(input)
      model = NestedNumericInput.new(input)

      [model.child, model.children.first, model.mapping["item"], model.union].each do |item|
        assert_instance_of Integer, item.amount
        assert_equal amount, item.amount
        assert_equal [amount, 1.25], item.numbers
        assert_instance_of Integer, item.mapping["value"]
      end
      assert_includes JSON.generate(model.to_h), amount.to_s
      assert_equal before, Marshal.dump(input)
    end

    it "still coerces integral JSON response numbers to Float at every nesting level" do
      child = { amount: 1, numbers: [2, 1.25], mapping: { "value" => 3 } }
      model = NestedNumericInput.load(JSON.generate(child: child, children: [child], mapping: { "item" => child }, union: child))

      [model.child, model.children.first, model.mapping["item"], model.union].each do |item|
        assert_instance_of Float, item.amount
        assert_instance_of Float, item.numbers.first
        assert_instance_of Float, item.mapping["value"]
      end
      assert_instance_of Float, Utils.coerce(Float, 1)
      assert_instance_of Float, NumericInput.coerce({ amount: 1 }).amount
      assert_instance_of Integer, NumericInput.new(amount: 1).amount
    end

    it "preserves keyword constructors and ordinary Float and string coercion" do
      model = NumericInput.new(amount: 1, preserve_integer_values: "a data field")

      assert_equal "a data field", model.preserve_integer_values
      assert_instance_of Integer, model.amount
      assert_instance_of Float, NumericInput.new(amount: 1.25).amount
      assert_in_delta 1.25, NumericInput.new(amount: "1.25").amount
      assert_equal(-Float::INFINITY, 1.0 / NumericInput.new(amount: -0.0).amount)
    end
  end

<% } %>  describe ".coerce" do
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
        assert_raises <%= gem_namespace %>::Internal::Errors::TypeError do
          Utils.coerce(String, Object.new, strict: true)
        end
      end

      it "converts String subclasses through to_s" do
        normalized = Class.new(String) do
          def to_s
            strip
          end
        end
        result = Utils.coerce(String, normalized.new(" padded "))

        assert_equal "padded", result
        assert_instance_of String, result
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
        assert_raises <%= gem_namespace %>::Internal::Errors::TypeError do
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

      it "coerces numeric Symbols such as symbolized JSON keys" do
        assert_equal 1, Utils.coerce(Integer, :"1")
        assert_equal(-20, Utils.coerce(Integer, :"-20"))
        assert_equal :foo, Utils.coerce(Integer, :foo)
        assert_equal :"1.5", Utils.coerce(Integer, :"1.5")
      end

      it "passes through value if it cannot be coerced and not strict" do
        obj = Object.new

        assert_equal obj, Utils.coerce(Integer, obj)
      end

      it "raises an error if value cannot be coerced and strict" do
        assert_raises <%= gem_namespace %>::Internal::Errors::TypeError do
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

      it "coerces numeric Symbols such as symbolized JSON keys" do
        assert_in_delta(1.5, Utils.coerce(Float, :"1.5"))
        assert_in_delta(2.0, Utils.coerce(Float, :"2"))
        assert_equal :foo, Utils.coerce(Float, :foo)
      end

      it "passes through value if it cannot be coerced and not strict" do
        obj = Object.new

        assert_equal obj, Utils.coerce(Float, obj)
      end

      it "raises an error if value cannot be coerced and strict" do
        assert_raises <%= gem_namespace %>::Internal::Errors::TypeError do
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
        extend <%= gem_namespace %>::Internal::Types::Enum

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
      StringArray = <%= gem_namespace %>::Internal::Types::Array[String]
      ModelArray = -> { <%= gem_namespace %>::Internal::Types::Array[TestUtils::M] }
      UnionArray = -> { <%= gem_namespace %>::Internal::Types::Array[TestUtils::U] }

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
<% if (serializeTimeAsIso8601) { %>
  describe ".serialize_times" do
    it "converts Time values to RFC 3339 strings with millisecond precision" do
      assert_equal "2026-10-16T01:40:16.000Z", Utils.serialize_times(Time.utc(2026, 10, 16, 1, 40, 16))
      assert_equal "2026-01-02T03:04:05.000+05:00", Utils.serialize_times(Time.new(2026, 1, 2, 3, 4, 5, "+05:00"))
    end

    it "converts Time values nested in hashes and arrays" do
      value = { begin_time: Time.utc(2026, 10, 16, 1, 40, 16), nested: { times: [Time.utc(2026, 1, 2, 3, 4, 5)] } }

      assert_equal(
        { begin_time: "2026-10-16T01:40:16.000Z", nested: { times: ["2026-01-02T03:04:05.000Z"] } },
        Utils.serialize_times(value)
      )
    end

    it "leaves Date, DateTime, and non-time values unchanged" do
      date = Date.new(2026, 10, 16)
      date_time = DateTime.new(2026, 10, 16, 1, 40, 16)
      value = { date: date, date_time: date_time, name: "plant", count: 3, active: true, missing: nil }

      assert_equal value, Utils.serialize_times(value)
    end
  end
<% } %>end
