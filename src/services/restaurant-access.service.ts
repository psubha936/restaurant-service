import { RestaurantMembershipStatus } from "../enums/restaurant-membership-status.enum.js";
import type { RestaurantMembershipRole } from "../enums/restaurant-membership-role.enum.js";
import type { RestaurantMembershipDocument } from "../models/restaurant-membership.model.js";

export function membershipAllowsRestaurantAccess(
  membership: RestaurantMembershipDocument | null,
  identityUserId: string,
  allowedRoles: readonly RestaurantMembershipRole[],
): boolean {
  return Boolean(
    membership &&
      membership.identityUserId === identityUserId &&
      membership.status === RestaurantMembershipStatus.Active &&
      allowedRoles.includes(membership.role),
  );
}

