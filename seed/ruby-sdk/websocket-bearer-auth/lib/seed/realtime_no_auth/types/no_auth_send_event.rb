# frozen_string_literal: true

module Seed
  module RealtimeNoAuth
    module Types
      class NoAuthSendEvent < Internal::Types::Model
        field :text, -> { String }, optional: false, nullable: false
      end
    end
  end
end
