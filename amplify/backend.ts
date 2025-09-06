import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { PubliqueStorage } from "./storage/resource";
defineBackend({ PubliqueStorage, auth, data });
