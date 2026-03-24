# frozen_string_literal: true

module Seed
  module Realtime
    module Types
      class ReceiveEvent < Internal::Types::Model
        field :data, -> { String }, optional: false, nullable: false
        field :timestamp, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
