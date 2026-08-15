import assert from "node:assert/strict";
import test from "node:test";
import { ObjectId } from "mongodb";
import { RestaurantMembershipRole } from "../src/enums/restaurant-membership-role.enum.js";
import { RestaurantMembershipStatus } from "../src/enums/restaurant-membership-status.enum.js";
import { RESTAURANT_MEMBERSHIP_COLLECTION, type RestaurantMembershipDocument } from "../src/models/restaurant-membership.model.js";
import { RESTAURANT_COLLECTION } from "../src/models/restaurant.model.js";
import { membershipAllowsRestaurantAccess } from "../src/services/restaurant-access.service.js";

function membership(overrides: Partial<RestaurantMembershipDocument> = {}): RestaurantMembershipDocument {
  const now = new Date();
  return {
    publicId: "rmb_test",
    restaurantId: new ObjectId(),
    identityUserId: "usr_owner",
    role: RestaurantMembershipRole.Owner,
    status: RestaurantMembershipStatus.Active,
    invitedByIdentityUserId: null,
    approvedByIdentityUserId: "usr_admin",
    joinedAt: now,
    revokedAt: null,
    revokedByIdentityUserId: null,
    revocationReason: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

test("restaurant models keep identity access in a membership collection", () => {
  assert.deepEqual(
    [RESTAURANT_COLLECTION.name, RESTAURANT_MEMBERSHIP_COLLECTION.name],
    ["restaurants", "restaurant_memberships"],
  );
});

test("restaurant access requires the same user, active membership, and allowed local role", () => {
  const ownerOnly = [RestaurantMembershipRole.Owner];

  assert.equal(membershipAllowsRestaurantAccess(membership(), "usr_owner", ownerOnly), true);
  assert.equal(membershipAllowsRestaurantAccess(membership(), "usr_other", ownerOnly), false);
  assert.equal(
    membershipAllowsRestaurantAccess(
      membership({ status: RestaurantMembershipStatus.Revoked }),
      "usr_owner",
      ownerOnly,
    ),
    false,
  );
  assert.equal(
    membershipAllowsRestaurantAccess(
      membership({ role: RestaurantMembershipRole.Staff }),
      "usr_owner",
      ownerOnly,
    ),
    false,
  );
});
