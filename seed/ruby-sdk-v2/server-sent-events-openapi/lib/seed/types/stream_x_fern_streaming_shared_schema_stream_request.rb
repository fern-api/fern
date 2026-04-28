# frozen_string_literal: true

module Seed
  module Types
    class StreamXFernStreamingSharedSchemaStreamRequest < Internal::Types::Model
      field :prompt, -> { String }, optional: false, nullable: false
      field :model, -> { String }, optional: false, nullable: false
      field :stream, -> { Internal::Types::Boolean }, optional: false, nullable: false
    end
  end
end
