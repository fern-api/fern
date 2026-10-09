# frozen_string_literal: true

module Seed
  module Internal
    # @api private
    #
    # Owns generation of the auto-generated idempotency key so the key-generation
    # logic and the underlying source of randomness live in a single place instead
    # of being repeated at every endpoint call site.
    class IdempotencyKey
      # @return [String] A freshly generated idempotency key.
      def self.generate
        SecureRandom.uuid
      end
    end
  end
end
