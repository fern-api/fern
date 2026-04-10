# frozen_string_literal: true

module Seed
  module Types
    # Requests compaction of history. Inherits stream_response from base and adds compact-specific fields.
    class UnionStreamCompactVariant < Internal::Types::Model
      field :data, -> { String }, optional: false, nullable: false
    end
  end
end
