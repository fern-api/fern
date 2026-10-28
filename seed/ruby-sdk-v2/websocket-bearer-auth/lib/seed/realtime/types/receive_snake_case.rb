# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Realtime
    module Types
      class ReceiveSnakeCase < Internal::Types::Model
        field :receive_text, -> { String }, optional: false, nullable: false

        field :receive_int, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
