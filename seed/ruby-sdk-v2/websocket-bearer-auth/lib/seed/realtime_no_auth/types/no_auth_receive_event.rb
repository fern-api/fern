# frozen_string_literal: true

module Seed
  module RealtimeNoAuth
    module Types
      class NoAuthReceiveEvent < Internal::Types::Model
        field :response, -> { String }, optional: false, nullable: false
      end
    end
  end
end
