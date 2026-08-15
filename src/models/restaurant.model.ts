import type { Db, ObjectId } from "mongodb";
import { ensureCollection, type MongoCollectionDefinition } from "../database/ensure-collection.js";
import { RestaurantStatus } from "../enums/restaurant-status.enum.js";

export interface RestaurantAddress {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
}

export interface RestaurantDocument {
  _id?: ObjectId;
  publicId: string;
  slug: string;
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: RestaurantAddress;
  status: RestaurantStatus;
  createdByIdentityUserId: string;
  approvedByIdentityUserId: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
}

export const RESTAURANT_COLLECTION: MongoCollectionDefinition = {
  name: "restaurants",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      additionalProperties: false,
      required: ["_id", "publicId", "slug", "name", "description", "phone", "email", "address", "status", "createdByIdentityUserId", "approvedByIdentityUserId", "approvedAt", "createdAt", "updatedAt", "closedAt"],
      properties: {
        _id: { bsonType: "objectId" },
        publicId: { bsonType: "string", minLength: 5, maxLength: 64 },
        slug: { bsonType: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$", maxLength: 120 },
        name: { bsonType: "string", minLength: 1, maxLength: 160 },
        description: { bsonType: ["string", "null"], maxLength: 2000 },
        phone: { bsonType: ["string", "null"], maxLength: 16 },
        email: { bsonType: ["string", "null"], maxLength: 320 },
        address: {
          bsonType: "object",
          additionalProperties: false,
          required: ["line1", "line2", "city", "state", "postalCode", "countryCode"],
          properties: {
            line1: { bsonType: "string", minLength: 1, maxLength: 200 },
            line2: { bsonType: ["string", "null"], maxLength: 200 },
            city: { bsonType: "string", minLength: 1, maxLength: 100 },
            state: { bsonType: "string", minLength: 1, maxLength: 100 },
            postalCode: { bsonType: "string", minLength: 3, maxLength: 20 },
            countryCode: { bsonType: "string", pattern: "^[A-Z]{2}$" },
          },
        },
        status: { enum: Object.values(RestaurantStatus) },
        createdByIdentityUserId: { bsonType: "string", minLength: 5, maxLength: 64 },
        approvedByIdentityUserId: { bsonType: ["string", "null"], maxLength: 64 },
        approvedAt: { bsonType: ["date", "null"] },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        closedAt: { bsonType: ["date", "null"] },
      },
    },
  },
  indexes: [
    { key: { publicId: 1 }, name: "restaurants_public_id_unique", unique: true },
    { key: { slug: 1 }, name: "restaurants_slug_unique", unique: true },
    { key: { status: 1, createdAt: -1 }, name: "restaurants_status_created" },
  ],
};

export function ensureRestaurantCollection(db: Db): Promise<void> {
  return ensureCollection(db, RESTAURANT_COLLECTION);
}

