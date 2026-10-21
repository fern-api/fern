# frozen_string_literal: true

require_relative "../.."

module Seed
  module RealtimeNoAuth
    module Types
      class NoAuthReceiveEvent < Internal::Types::Model
        field :response, -> { String }, optional: false, nullable: false
      end
    end
  end
end
