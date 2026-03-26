# frozen_string_literal: true

module Seed
  module Completions
    module Types
      class EventEvent < Internal::Types::Model
        field :event, -> { String }, optional: false, nullable: false
        field :name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
