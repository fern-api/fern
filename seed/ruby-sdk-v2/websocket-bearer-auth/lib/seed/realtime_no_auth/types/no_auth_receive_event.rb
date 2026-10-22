# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module RealtimeNoAuth
    module Types
      class NoAuthReceiveEvent < Internal::Types::Model
        field :response, -> { String }, optional: false, nullable: false
      end
    end
  end
end
