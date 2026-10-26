# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class CompletionRequest < Internal::Types::Model
      field :query, -> { String }, optional: false, nullable: false

      field :stream, -> { Internal::Types::Boolean }, optional: true, nullable: false
    end
  end
end
