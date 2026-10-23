# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    module DialRecordItem
      extend Seed::Internal::Types::Enum

      RECORD_FROM_ANSWER = "record-from-answer"
      RECORD_FROM_RINGING = "record-from-ringing"
    end
  end
end
