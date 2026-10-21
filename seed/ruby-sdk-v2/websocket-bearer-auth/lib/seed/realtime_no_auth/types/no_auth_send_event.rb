# frozen_string_literal: true

require_relative "../.."

module Seed
  module RealtimeNoAuth
    module Types
      class NoAuthSendEvent < Internal::Types::Model
        field :text, -> { String }, optional: false, nullable: false
      end
    end
  end
end
