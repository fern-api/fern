# frozen_string_literal: true

module Seed
  module Types
    class StreamRequest < Internal::Types::Model
      field :query, -> { String }, optional: true, nullable: false
    end
  end
end
