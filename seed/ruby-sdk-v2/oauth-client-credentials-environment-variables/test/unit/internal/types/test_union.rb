# frozen_string_literal: true

require "test_helper"

describe FernOauthClientCredentialsEnvironmentVariables::Internal::Types::Union do
  class Rectangle < FernOauthClientCredentialsEnvironmentVariables::Internal::Types::Model
    literal :type, "square"

    field :area, Float
  end

  class Circle < FernOauthClientCredentialsEnvironmentVariables::Internal::Types::Model
    literal :type, "circle"

    field :area, Float
  end

  class Pineapple < FernOauthClientCredentialsEnvironmentVariables::Internal::Types::Model
    literal :type, "pineapple"

    field :area, Float
  end

  module Shape
    extend FernOauthClientCredentialsEnvironmentVariables::Internal::Types::Union

    discriminant :type

    member -> { Rectangle }, key: "rect"
    member -> { Circle }, key: "circle"
  end

  module StringOrInteger
    extend FernOauthClientCredentialsEnvironmentVariables::Internal::Types::Union

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
