# frozen_string_literal: true

module SeedNullableOptionalClient
  class NullableOptional
    # Test enum with values for optional enum fields
    class UserStatus
      ACTIVE = "active"
      INACTIVE = "inactive"
      SUSPENDED = "suspended"
      DELETED = "deleted"
    end
  end
end
