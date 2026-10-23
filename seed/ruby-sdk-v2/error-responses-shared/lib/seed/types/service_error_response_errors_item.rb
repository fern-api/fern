# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class ServiceErrorResponseErrorsItem < Internal::Types::Model
      field :field, -> { String }, optional: true, nullable: false

      field :message, -> { String }, optional: true, nullable: false
    end
  end
end
