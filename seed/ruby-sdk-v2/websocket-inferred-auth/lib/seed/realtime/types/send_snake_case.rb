# frozen_string_literal: true

module Seed
  module Realtime
    module Types
      class SendSnakeCase < Internal::Types::Model
        field :send_text, -> { String }, optional: false, nullable: false
        field :send_param, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
