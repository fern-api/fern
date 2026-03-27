# frozen_string_literal: true

module Seed
  module Types
    class StatusPayload < Internal::Types::Model
      field :message, -> { String }, optional: false, nullable: false
      field :timestamp, -> { String }, optional: false, nullable: false
    end
  end
end
