# frozen_string_literal: true

module FernQueryParametersOpenapiAsObjects
  module Types
    class User < Internal::Types::Model
      field :name, -> { String }, optional: true, nullable: false
      field :tags, -> { Internal::Types::Array[String] }, optional: true, nullable: false
    end
  end
end
