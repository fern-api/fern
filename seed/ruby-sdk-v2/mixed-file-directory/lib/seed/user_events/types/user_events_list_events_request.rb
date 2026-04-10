# frozen_string_literal: true

module Seed
  module UserEvents
    module Types
      class UserEventsListEventsRequest < Internal::Types::Model
        field :limit, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
