# frozen_string_literal: true

module Seed
  module Types
    class StreamEventOne < Internal::Types::Model
      field :event, -> { Seed::Types::StreamEventOneEvent }, optional: false, nullable: false
    end
  end
end
