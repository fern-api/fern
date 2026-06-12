# frozen_string_literal: true

module Seed
  module Types
    # Cancels the current operation. Inherits stream_response from base.
    class UnionStreamInterruptVariant < Internal::Types::Model
      field :stream_response, -> { Internal::Types::Boolean }, optional: true, nullable: false

      field :prompt, -> { String }, optional: false, nullable: false
    end
  end
end
