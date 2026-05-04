# frozen_string_literal: true

module Seed
  module Types
    # A user input message. Inherits stream_response from base via allOf.
    class UnionStreamMessageVariant < Internal::Types::Model
      field :message, -> { String }, optional: false, nullable: false
    end
  end
end
