# frozen_string_literal: true

module Seed
  module Types
    # A user input message. Inherits stream_response from base via allOf.
    class UnionStreamMessageVariant < Internal::Types::Model
      field :stream_response, -> { Internal::Types::Boolean }, optional: true, nullable: false

      field :prompt, -> { String }, optional: false, nullable: false

      field :message, -> { String }, optional: false, nullable: false
    end
  end
end
