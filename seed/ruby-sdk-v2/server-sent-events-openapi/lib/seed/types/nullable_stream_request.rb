# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class NullableStreamRequest < Internal::Types::Model
      field :query, -> { String }, optional: false, nullable: false

      field :stream, -> { Internal::Types::Boolean }, optional: true, nullable: true
    end
  end
end
