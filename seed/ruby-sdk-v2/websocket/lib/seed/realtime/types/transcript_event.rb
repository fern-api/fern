# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Realtime
    module Types
      class TranscriptEvent < Internal::Types::Model
        field :type, -> { String }, optional: false, nullable: false

        field :data, -> { String }, optional: false, nullable: false
      end
    end
  end
end
