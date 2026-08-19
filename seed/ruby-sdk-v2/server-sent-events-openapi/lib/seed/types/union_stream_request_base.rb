# frozen_string_literal: true

module Seed
  module Types
    # Base schema for union stream requests. Contains the stream_response field that is inherited by all oneOf variants
    # via allOf. This schema is also referenced directly by a non-streaming endpoint to ensure it is not excluded from
    # the context.
    class UnionStreamRequestBase < Internal::Types::Model
      field :stream_response, -> { Internal::Types::Boolean }, optional: true, nullable: false

      field :prompt, -> { String }, optional: false, nullable: false
    end
  end
end
