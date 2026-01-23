# frozen_string_literal: true

require "test_helper"

describe FernMixedCase::Internal::Types::Union do
  class Rectangle < FernMixedCase::Internal::Types::Model
    literal :type, "square"

    field :area, Float
  end

  class Circle < FernMixedCase::Internal::Types::Model
    literal :type, "circle"

    field :area, Float
  end

  class Pineapple < FernMixedCase::Internal::Types::Model
    literal :type, "pineapple"

    field :area, Float
  end

  module Shape
    extend FernMixedCase::Internal::Types::Union

    discriminant :type

    member -> { Rectangle }, key: "rect"
    member -> { Circle }, key: "circle"
  end

  module StringOrInteger
    extend FernMixedCase::Internal::Types::Union

    member String
    member Integer
  end

  describe "#coerce" do
    it "coerces hashes into member models with discriminated unions" do
      circle = Shape.coerce({ type: "circle", area: 4.0 })

      assert_instance_of Circle, circle
    end
  end

  describe "#member" do
    it "defines Model members" do
      assert Shape.member?(Rectangle)
      assert Shape.member?(Circle)
      refute Shape.member?(Pineapple)
    end

    it "defines other members" do
      assert StringOrInteger.member?(String)
      assert StringOrInteger.member?(Integer)
      refute StringOrInteger.member?(Float)
      refute StringOrInteger.member?(Pineapple)
    end
  end
end
