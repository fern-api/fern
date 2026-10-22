# frozen_string_literal: true

module Seed
  module Types
    class ServiceErrorResponseErrorsItem < Internal::Types::Model
      field :field, -> { String }, optional: true, nullable: false

      field :message, -> { String }, optional: true, nullable: false
    end
  end
end
