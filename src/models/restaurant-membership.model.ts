import type { Db, ObjectId } from "mongodb";
import { ensureCollection, type MongoCollectionDefinition } from "../database/ensure-collection.js";
import { RestaurantMembershipRole } from "../enums/restaurant-membership-role.enum.js";
import { RestaurantMembershipStatus } from "../enums/restaurant-membership-status.enum.js";

export interface RestaurantMembershipDocument {
  _id?: ObjectId;
  publicId: string;
  restaurantId: ObjectId;
  identityUserId: string;
  role: RestaurantMembershipRole;
  status: RestaurantMembershipStatus;
  invitedByIdentityUserId: string | null;
  approvedByIdentityUserId: string | null;
  joinedAt: Date | null;
  revokedAt: Date | null;
  revokedByIdentityUserId: string | null;
  revocationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const RESTAURANT_MEMBERSHIP_COLLECTION: MongoCollectionDefinition = {
  name: "restaurant_memberships",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      additionalProperties: false,
      required: ["_id", "publicId", "restaurantId", "identityUserId", "role", "status", "invitedByIdentityUserId", "approvedByIdentityUserId", "joinedAt", "revokedAt", "revokedByIdentityUserId", "revocationReason", "createdAt", "updatedAt"],
      properties: {
        _id: { bsonType: "objectId" },
        publicId: { bsonType: "string", minLength: 5, maxLength: 64 },
        restaurantId: { bsonType: "objectId" },
        identityUserId: { bsonType: "string", minLength: 5, maxLength: 64 },
        role: { enum: Object.values(RestaurantMembershipRole) },
        status: { enum: Object.values(RestaurantMembershipStatus) },
        invitedByIdentityUserId: { bsonType: ["string", "null"], maxLength: 64 },
        approvedByIdentityUserId: { bsonType: ["string", "null"], maxLength: 64 },
        joinedAt: { bsonType: ["date", "null"] },
        revokedAt: { bsonType: ["date", "null"] },
        revokedByIdentityUserId: { bsonType: ["string", "null"], maxLength: 64 },
        revocationReason: { bsonType: ["string", "null"], maxLength: 500 },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
  indexes: [
    { key: { publicId: 1 }, name: "restaurant_memberships_public_id_unique", unique: true },
    { key: { restaurantId: 1, identityUserId: 1 }, name: "restaurant_memberships_active_unique", unique: true, partialFilterExpression: { status: { $in: [RestaurantMembershipStatus.Invited, RestaurantMembershipStatus.Active] } } },
    { key: { identityUserId: 1, status: 1 }, name: "restaurant_memberships_user_status" },
    { key: { restaurantId: 1, role: 1, status: 1 }, name: "restaurant_memberships_restaurant_role_status" },
  ],
};

export function ensureRestaurantMembershipCollection(db: Db): Promise<void> {
  return ensureCollection(db, RESTAURANT_MEMBERSHIP_COLLECTION);
}

