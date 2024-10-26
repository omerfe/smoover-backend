import { CollectionConfig } from "payload/types";

const Users: CollectionConfig = {
  slug: "users",
  auth: {
    useAPIKey: true,
    tokenExpiration: 7200, // 2 hours
    maxLoginAttempts: 5,
    lockTime: 600 * 1000, // 10 minutes
  },
  admin: {
    useAsTitle: "email",
  },
  fields: [
    {
      name: "username",
      type: "text",
      required: true,
      unique: true,
    },
    // Email added by default
    // Add more fields as needed
  ],
};

export default Users;
