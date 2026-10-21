# frozen_string_literal: true

require_relative "../.."

module Seed
  module Realtime
    module Types
      class SendEvent < Internal::Types::Model
        field :text, -> { String }, optional: false, nullable: false

        field :priority, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
