# frozen_string_literal: true

module Seed
  module Types
    class FlushedEvent < Internal::Types::Model
      field :type, -> { Seed::Types::FlushedEventType }, optional: false, nullable: false
    end
  end
end
