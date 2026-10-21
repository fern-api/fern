# frozen_string_literal: true

require_relative "../.."

module Seed
  module Realtime
    module Types
      class FlushedEvent < Internal::Types::Model
        field :type, -> { String }, optional: false, nullable: false
      end
    end
  end
end
