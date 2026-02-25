# frozen_string_literal: true

require "test_helper"

describe Seed::Internal::Types::Union do
  class Rectangle < Seed::Internal::Types::Model
    literal :type, "square"

    field :area, Float
  end

  class Circle < Seed::Internal::Types::Model
    literal :type, "circle"

    field :area, Float
  end

  class Pineapple < Seed::Internal::Types::Model
    literal :type, "pineapple"

    field :area, Float
  end

  module Shape
    extend Seed::Internal::Types::Union

    discriminant :type

    member -> { Rectangle }, key: "rect"
    member -> { Circle }, key: "circle"
  end

  module StringOrInteger
    extend Seed::Internal::Types::Union

    member String
    member Integer
  end

  describe "#coerce" do
    it "coerces hashes into member models with discriminated unions" do
      circle = Shape.coerce({ type: "circle", area: 4.0 })

      assert_instance_of Circle, circle
    end
  end

  describe "#type_member?" do
    it "defines Model members" do
      assert Shape.type_member?(Rectangle)
      assert Shape.type_member?(Circle)
      refute Shape.type_member?(Pineapple)
    end

    it "defines other members" do
      assert StringOrInteger.type_member?(String)
      assert StringOrInteger.type_member?(Integer)
      refute StringOrInteger.type_member?(Float)
      refute StringOrInteger.type_member?(Pineapple)
    end
  end
end
