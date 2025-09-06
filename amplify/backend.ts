import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource.js";
import { data } from "./data/resource.js";
import { PubliqueStorage } from "./storage/resource";
defineBackend({ PubliqueStorage, auth, data });
