import { Amplify } from "aws-amplify";
import type { ResourcesConfig } from "aws-amplify";

export function configureAmplify(config: ResourcesConfig) {
  Amplify.configure(config);
}
