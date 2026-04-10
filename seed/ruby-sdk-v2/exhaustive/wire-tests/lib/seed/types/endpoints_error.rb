# frozen_string_literal: true

module Seed
  module Types
    class EndpointsError < Internal::Types::Model
      field :category, -> { Seed::Types::EndpointsErrorCategory }, optional: false, nullable: false
      field :code, -> { Seed::Types::EndpointsErrorCode }, optional: false, nullable: false
      field :detail, -> { String }, optional: true, nullable: false
      field :field, -> { String }, optional: true, nullable: false
    end
  end
end
